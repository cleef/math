#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"
PID_FILE="$RUN_DIR/math-hub.pid"
LOG_FILE="$RUN_DIR/math-hub.log"

is_running() {
  if [[ ! -f "$PID_FILE" ]]; then
    return 1
  fi

  local pid
  pid="$(cat "$PID_FILE")"
  if [[ -z "$pid" ]]; then
    return 1
  fi

  kill -0 "$pid" 2>/dev/null
}

start_daemon() {
  mkdir -p "$RUN_DIR"

  if is_running; then
    echo "Math Hub already running (pid $(cat "$PID_FILE"))."
    echo "Use ./stop.sh to stop it first if needed."
    return 0
  fi

  if [[ -f "$PID_FILE" ]]; then
    rm -f "$PID_FILE"
  fi

  cd "$ROOT_DIR"
  nohup npm run dev >"$LOG_FILE" 2>&1 &
  echo "$!" >"$PID_FILE"

  echo "Math Hub started in daemon mode."
  echo "pid: $(cat "$PID_FILE")"
  echo "log: $LOG_FILE"
}

cd "$ROOT_DIR"
if [[ "${1:-}" == "-d" ]]; then
  start_daemon
else
  npm run dev
fi
