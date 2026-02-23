#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"
PID_FILE="$RUN_DIR/math-hub.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "No daemon pid file found at $PID_FILE"
  exit 0
fi

pid="$(cat "$PID_FILE")"

if [[ -z "$pid" ]]; then
  rm -f "$PID_FILE"
  echo "Removed empty pid file."
  exit 0
fi

if kill -0 "$pid" 2>/dev/null; then
  kill "$pid" 2>/dev/null || true
  for _ in {1..20}; do
    if ! kill -0 "$pid" 2>/dev/null; then
      break
    fi
    sleep 0.2
  done

  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true
  fi

  echo "Stopped Math Hub daemon (pid $pid)."
else
  echo "Process $pid is not running."
fi

rm -f "$PID_FILE"
