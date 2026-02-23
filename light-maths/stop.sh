#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT_DIR/.run"
API_PORT="${LIGHT_APPS_API_GATEWAY_PORT:-7060}"
FRONTEND_PORT=5174

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

port_listener_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -t -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | sort -u
    return
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltnp "( sport = :$port )" | sed -nE 's/.*pid=([0-9]+).*/\1/p' | sort -u
    return
  fi
}

stop_port_listener() {
  local name="$1"
  local port="$2"

  if ! port_in_use "$port"; then
    return 0
  fi

  local pids
  pids="$(port_listener_pids "$port")"
  if [[ -z "$pids" ]]; then
    echo "$name: port $port still in use (unable to resolve pid)"
    return 1
  fi

  local pid
  for pid in $pids; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  sleep 0.3

  for pid in $pids; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  done

  echo "$name: stopped residual listener(s) on port $port (pid: $(echo "$pids" | tr '\n' ' ' | sed 's/[[:space:]]*$//'))"
}

stop_pid_file() {
  local name="$1"
  local pid_file="$2"
  local fallback_port="$3"

  if [[ ! -f "$pid_file" ]]; then
    echo "$name: no pid file"
    stop_port_listener "$name" "$fallback_port"
    return 0
  fi

  local pid
  pid="$(cat "$pid_file")"

  if [[ -z "$pid" ]]; then
    rm -f "$pid_file"
    echo "$name: removed empty pid file"
    stop_port_listener "$name" "$fallback_port"
    return 0
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

    echo "$name: stopped pid $pid"
  else
    echo "$name: process $pid not running"
  fi

  rm -f "$pid_file"

  stop_port_listener "$name" "$fallback_port"
}

stop_pid_file "Frontend host" "$RUN_DIR/apps-frontend.pid" "$FRONTEND_PORT"
stop_pid_file "API gateway" "$RUN_DIR/apps-api.pid" "$API_PORT"
