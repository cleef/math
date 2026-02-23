#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_PORT="${LIGHT_APPS_API_GATEWAY_PORT:-7060}"
child_pid=""

port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn "( sport = :$port )" | tail -n +2 | grep -q .
    return $?
  fi

  return 1
}

print_port_owner() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN || true
    return
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltnp | grep -E ":${port}\\b" || true
    return
  fi
}

if port_in_use "$API_PORT"; then
  echo "ERROR: API gateway port $API_PORT is already in use."
  print_port_owner "$API_PORT"
  exit 1
fi

cd "$ROOT_DIR"

shutdown_child() {
  if [[ -n "${child_pid:-}" ]] && kill -0 "$child_pid" 2>/dev/null; then
    kill "$child_pid" 2>/dev/null || true
    wait "$child_pid" 2>/dev/null || true
  fi
}

run_child_command() {
  "$@" &
  child_pid=$!
  wait "$child_pid"
  child_pid=""
}

trap shutdown_child TERM INT

run_child_command npm run start:api
