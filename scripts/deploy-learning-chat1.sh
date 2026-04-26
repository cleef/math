#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DRY_RUN=0
SKIP_BUILD=0

REMOTE_HOST="root@47.116.122.50"
DOMAIN="learning.chat1.co"
REMOTE_BASE="/var/www/learning.chat1.co"
RELEASE_ID="$(date +%Y%m%d-%H%M%S)"

usage() {
  cat <<'USAGE'
Usage: scripts/deploy-learning-chat1.sh [options]

Options:
  --dry-run                Print commands without executing them
  --skip-build             Skip local npm build steps
  --release-id <id>        Override release id (default: YYYYMMDD-HHMMSS)
  --host <user@host>       Remote SSH host (default: root@47.116.122.50)
  --domain <domain>        Public domain for smoke checks (default: learning.chat1.co)
  --remote-base <path>     Remote static root (default: /var/www/learning.chat1.co)
  -h, --help               Show this help
USAGE
}

log() {
  printf '[deploy] %s\n' "$*"
}

run() {
  printf '+ %s\n' "$*"
  if [[ "$DRY_RUN" -eq 0 ]]; then
    eval "$@"
  fi
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing required command: $1" >&2
    exit 1
  }
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --release-id)
      RELEASE_ID="${2:-}"
      shift 2
      ;;
    --host)
      REMOTE_HOST="${2:-}"
      shift 2
      ;;
    --domain)
      DOMAIN="${2:-}"
      shift 2
      ;;
    --remote-base)
      REMOTE_BASE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

[[ -n "$RELEASE_ID" ]] || { echo "release id cannot be empty" >&2; exit 1; }
[[ -n "$REMOTE_HOST" ]] || { echo "host cannot be empty" >&2; exit 1; }
[[ -n "$DOMAIN" ]] || { echo "domain cannot be empty" >&2; exit 1; }
[[ -n "$REMOTE_BASE" ]] || { echo "remote base cannot be empty" >&2; exit 1; }

require_cmd npm
require_cmd node
require_cmd rsync
require_cmd ssh
require_cmd curl

LOCAL_RELEASE_DIR="/tmp/light-learning-release-$RELEASE_ID"
REMOTE_RELEASE_DIR="$REMOTE_BASE/releases/$RELEASE_ID"

log "release id: $RELEASE_ID"
log "remote host: $REMOTE_HOST"
log "domain: $DOMAIN"
log "remote base: $REMOTE_BASE"

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  run "cd \"$ROOT_DIR/light-learning-hub\" && npm run build"
  run "cd \"$ROOT_DIR/light-learning-apps\" && npm run build:all"
else
  log "skip build enabled"
fi

APP_IDS="$(
  cd "$ROOT_DIR"
  node -e 'const fs=require("fs"); const apps=JSON.parse(fs.readFileSync("light-learning-hub/src/data/apps.json","utf8")); console.log(apps.filter(a=>a.enabled&&a.listed).map(a=>a.id).join(" "));'
)"

if [[ -z "$APP_IDS" ]]; then
  echo "no enabled+listed apps found in light-learning-hub/src/data/apps.json" >&2
  exit 1
fi

run "rm -rf \"$LOCAL_RELEASE_DIR\""
run "mkdir -p \"$LOCAL_RELEASE_DIR/apps\""
run "cp -R \"$ROOT_DIR/light-learning-hub/dist/.\" \"$LOCAL_RELEASE_DIR/\""

for app_id in $APP_IDS; do
  if [[ ! -d "$ROOT_DIR/light-learning-apps/dist/apps/$app_id" ]]; then
    echo "missing app build output: light-learning-apps/dist/apps/$app_id" >&2
    exit 1
  fi
  run "cp -R \"$ROOT_DIR/light-learning-apps/dist/apps/$app_id\" \"$LOCAL_RELEASE_DIR/apps/$app_id\""
done

run "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 \"$REMOTE_HOST\" \"mkdir -p $REMOTE_RELEASE_DIR\""
run "rsync -az --delete -e 'ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8' \"$LOCAL_RELEASE_DIR/\" \"$REMOTE_HOST:$REMOTE_RELEASE_DIR/\""
run "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 \"$REMOTE_HOST\" \"if [[ -d $REMOTE_BASE/current && ! -L $REMOTE_BASE/current ]]; then mv $REMOTE_BASE/current $REMOTE_BASE/current.dir.bak.$RELEASE_ID; fi; ln -sfn $REMOTE_RELEASE_DIR $REMOTE_BASE/current && chown -h nginx:nginx $REMOTE_BASE/current && chown -R nginx:nginx $REMOTE_BASE\""
run "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=8 \"$REMOTE_HOST\" \"nginx -t && systemctl reload nginx\""

run "curl -I -m 10 -sS https://$DOMAIN/"
run "curl -I -m 10 -sS https://$DOMAIN/math"
run "curl -I -m 10 -sS https://$DOMAIN/english"
for app_id in $APP_IDS; do
  run "curl -I -m 10 -sS https://$DOMAIN/apps/$app_id/"
done

log "deployment finished"
log "remote release: $REMOTE_RELEASE_DIR"
