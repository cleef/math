# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This Project

A monorepo of interactive educational math applications. Each app is a standalone React + Vite + TypeScript project that builds to `dist/apps/<id>/` and is served by **light-learning-hub** (a separate repo).

## Common Commands

### Root-level
```bash
npm run build:all         # Install deps + build all apps sequentially
npm run list:apps         # List app IDs and names
npm run dev:api           # Start API Gateway (port 7060)
./start.sh                # Start static frontend (5174) + API Gateway (7060)
./start.sh -d             # Same but daemonized (logs in .run/)
./stop.sh                 # Stop daemons
```

### Per-app (cd apps/<id> first)
```bash
npm install
npm run dev               # Vite dev server with HMR
npm run build             # tsc check + vite build → ../../dist/apps/<id>/
npm run preview           # Preview the built output locally
```

## Architecture

### App Structure

Each app under `apps/<id>/` follows the same convention:

- **`light-app.json`** — app manifest: `id`, `name`, `version`, `description`, `icon`, `entry`, `owner`
- **`vite.config.ts`** — reads `light-app.json` to set `base: /apps/<id>/` and `outDir: ../../dist/apps/<id>/`
- **Dual entry:** `index.html` + `game-spotlight.html` (built separately by Vite multi-input)
- **React 18.3.1 + TypeScript 5.5.4 + Vite 5.x** (same stack across all apps)

### Build Pipeline

`scripts/build-all.mjs` iterates every directory in `apps/`, runs `npm install` + `npm run build` in each, and collects results. All built output lands in `dist/apps/<id>/`.

### API Gateway (`server/gateway.mjs`)

An optional Node.js gateway (port 7060) that manages backend processes for apps that declare a `light-api.json`. It:
- Spawns the app's backend process on first request and proxies traffic to it
- Polls `/health` until the process is ready (20 s timeout)
- Auto-stops idle processes after 15 min (configurable via env vars)
- Routes: `/api/apps/<app-id>/*` → proxied to spawned process

Key env vars: `LIGHT_APPS_API_GATEWAY_PORT`, `LIGHT_APPS_API_IDLE_TTL_SEC`, `LIGHT_APPS_API_STARTUP_TIMEOUT_MS`, `LIGHT_APPS_API_AUTH_TOKEN`.

### Hub Integration

**light-learning-hub** (separate repo) loads apps by fetching:
1. `/apps/<id>/lesson-spotlight.html` (preferred)
2. `/apps/<id>/game-spotlight.html` (fallback)

Apps register in `light-learning-hub/src/data/apps.json` with a matching `id`.

## Creating a New App

```bash
cp -R templates/light-app apps/my-new-app
cd apps/my-new-app
# Edit light-app.json — set id, name, description, icon, owner
npm install
npm run dev    # → http://localhost:5173/apps/my-new-app/
```

The `id` in `light-app.json` must be unique and match the directory name. Vite picks it up automatically for the base path and output directory.

## Local Development with Hub

```bash
# Terminal 1 — serve built apps
npm run build:all
python -m http.server 5174 --directory dist

# Terminal 2 — run hub pointing at local apps
cd ../light-learning-hub
LIGHT_LEARNING_APPS_HOST_URL=http://localhost:5174 npm run dev -- --host 0.0.0.0 --port 5173
```
