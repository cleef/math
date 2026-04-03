# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This Project

A math education platform (https://math.chat1.co) with two sub-projects:

- **`light-math-hub/`** — React + Vite hub application: the entry point users see, displays app catalog, routes to individual apps
- **`light-maths/`** — Collection of standalone interactive math apps; see `light-maths/CLAUDE.md` for app-specific guidance

## Common Commands

### light-math-hub
```bash
cd light-math-hub
npm run dev       # Dev server (port 5173) — proxies /apps/* and /api/apps/*
npm run build     # tsc check + vite build
npm run preview   # Preview the built output
```

### light-maths (see also light-maths/CLAUDE.md)
```bash
cd light-maths
npm run build:all   # Install + build all apps → dist/apps/<id>/
./start.sh          # Serve built apps (5174) + API Gateway (7060)
./start.sh -d       # Daemonized; logs in .run/
./stop.sh           # Stop daemons
```

### Deployment
```bash
./scripts/deploy-math-chat1.sh            # Build locally, rsync to 47.116.122.50, nginx reload
./scripts/deploy-math-chat1.sh --dry-run  # Simulate without changes
./scripts/deploy-math-chat1.sh --skip-build  # Deploy already-built artifacts
```

## Architecture

### Request Flow (local dev)

```
Browser → light-math-hub (5173)
              ├── /apps/*        → proxy → static host (5174) [dist/apps/<id>/]
              └── /api/apps/*    → proxy → API Gateway (7060) [spawns per-app backends]
```

`light-math-hub/vite.config.ts` sets up these proxies. Env vars controlling them:
- `LIGHT_APPS_HOST_URL` (default: `http://localhost:5174`)
- `LIGHT_APPS_API_GATEWAY_URL` (default: `http://localhost:7060`)

### App Registry

Apps register in **`light-math-hub/src/data/apps.json`**. Each entry needs an `id` that matches a directory in `light-maths/apps/<id>/`. The hub loads the app's spotlight page via `/apps/<id>/lesson-spotlight.html` (falls back to `game-spotlight.html`).

### light-math-hub Structure

- `src/data/apps.json` — app catalog (id, name, icon, status, listed, enabled)
- `src/` — React + React Router 6 app; routes to hub listing and app detail/launch pages
- Environment-driven: hub behavior (host URL, gateway URL, idle timeout) is configured via env vars injected by Vite

### Creating or Registering a New App

1. Create the app in `light-maths/apps/<id>/` (see `light-maths/CLAUDE.md`)
2. Add an entry to `light-math-hub/src/data/apps.json` with the matching `id`
