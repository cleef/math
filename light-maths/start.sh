#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"
API_PID_FILE="$RUN_DIR/apps-api.pid"
API_LOG_FILE="$RUN_DIR/apps-api.log"
FRONTEND_PID_FILE="$RUN_DIR/apps-frontend.pid"
FRONTEND_LOG_FILE="$RUN_DIR/apps-frontend.log"
API_PORT="${LIGHT_APPS_API_GATEWAY_PORT:-7060}"
FRONTEND_PORT=5174

is_pid_running() {
  local pid_file="$1"

  if [[ ! -f "$pid_file" ]]; then
    return 1
  fi

  local pid
  pid="$(cat "$pid_file")"
  if [[ -z "$pid" ]]; then
    return 1
  fi

  kill -0 "$pid" 2>/dev/null
}

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

require_port_available() {
  local port="$1"
  local name="$2"
  if port_in_use "$port"; then
    echo "ERROR: $name port $port is already in use."
    print_port_owner "$port"
    exit 1
  fi
}

start_component_daemon() {
  local name="$1"
  local script="$2"
  local pid_file="$3"
  local log_file="$4"

  if is_pid_running "$pid_file"; then
    echo "$name already running (pid $(cat "$pid_file"))."
    return 0
  fi

  if [[ -f "$pid_file" ]]; then
    rm -f "$pid_file"
  fi

  (
    cd "$ROOT_DIR"
    nohup "$script" >"$log_file" 2>&1 &
    echo "$!" >"$pid_file"
  )

  sleep 0.4
  if ! is_pid_running "$pid_file"; then
    echo "ERROR: failed to start $name in daemon mode."
    echo "Check log: $log_file"
    tail -n 40 "$log_file" 2>/dev/null || true
    rm -f "$pid_file"
    exit 1
  fi

  echo "$name started in daemon mode (pid $(cat "$pid_file"))."
}

start_daemon() {
  mkdir -p "$RUN_DIR"
  cd "$ROOT_DIR"

  if ! is_pid_running "$API_PID_FILE"; then
    require_port_available "$API_PORT" "API gateway"
  fi
  if ! is_pid_running "$FRONTEND_PID_FILE"; then
    require_port_available "$FRONTEND_PORT" "Frontend host"
  fi

  start_component_daemon "API gateway" "./start-api.sh" "$API_PID_FILE" "$API_LOG_FILE"
  start_component_daemon "Frontend host" "./start-frontend.sh" "$FRONTEND_PID_FILE" "$FRONTEND_LOG_FILE"

  echo "Daemon logs:"
  echo "- $API_LOG_FILE"
  echo "- $FRONTEND_LOG_FILE"
  echo "Use ./stop.sh to stop daemon processes."
}

start_foreground() {
  require_port_available "$API_PORT" "API gateway"
  require_port_available "$FRONTEND_PORT" "Frontend host"

  cleanup() {
    if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" 2>/dev/null; then
      kill "$API_PID" 2>/dev/null || true
      wait "$API_PID" 2>/dev/null || true
    fi
  }

  trap cleanup EXIT INT TERM

  cd "$ROOT_DIR"
  ./start-api.sh &
  API_PID=$!

  ./start-frontend.sh
}

if [[ "${1:-}" == "-d" ]]; then
  start_daemon
else
  start_foreground
fi
