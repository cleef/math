# AGENTS.md - light-math

This file is the working guide for Codex in this repository.

## 1) Project Snapshot

- Repo: `math`
- Type: multi-project frontend repo for math teaching apps
- Main modules:
  - `light-math-hub`: math app lobby frontend (React + Vite)
  - `light-maths`: math app collection, templates, static build host scripts, optional API gateway
- Production domain: `math.chat1.co`

## 2) Tech Stack and Runtime

- Frontend stack: React 18 + TypeScript + Vite
- Package manager: npm (`package-lock.json` in subprojects)
- No root workspace scripts; run commands inside subproject folders.

Default local ports:
- Hub dev server: `5173`
- Apps static host: `5174`
- Apps API gateway: `7060`

## 3) Architecture (Request Flow)

1. User opens Hub (`light-math-hub`) at `/`.
2. Hub lists apps from `light-math-hub/src/data/apps.json`.
3. Hub proxies:
   - `/apps/*` -> apps static host (`LIGHT_APPS_HOST_URL`, default `http://localhost:5174`)
   - `/api/apps/*` -> API gateway (`LIGHT_APPS_API_GATEWAY_URL`, default `http://localhost:7060`)
4. Launch flow:
   - Hub route `/run/:id` redirects to `entryPath` (usually `/apps/<id>/`)
5. Each app is built into `light-maths/dist/apps/<id>/`.

## 4) High-Value Paths

- Root overview: `README.md`
- Deploy script: `scripts/deploy-math-chat1.sh`
- Hub:
  - `light-math-hub/src/App.tsx`
  - `light-math-hub/src/data/apps.json`
  - `light-math-hub/src/data/currentUser.ts`
  - `light-math-hub/vite.config.ts`
- Apps host:
  - `light-maths/scripts/build-all.mjs`
  - `light-maths/server/gateway.mjs`
  - `light-maths/docs/light-app-standard.md`
  - `light-maths/templates/light-app/*`
- Sample app:
  - `light-maths/apps/fraction-lab/*`

## 5) Core Contracts to Preserve

### App Packaging Contract
- Every app lives in `light-maths/apps/<id>/`.
- Every app has `light-app.json` with at least: `id`, `name`, `version`, `description`, `entry`.
- Vite `base` must stay `/apps/<id>/`.
- Build output must stay `light-maths/dist/apps/<id>/`.
- Multi-entry build should include `index.html` and `game-spotlight.html`.

### Hub Registry Contract
- Hub only shows what is declared in `light-math-hub/src/data/apps.json`.
- App is visible only when all are true:
  - `enabled === true`
  - `listed !== false`
  - user has at least one required permission (if permissions are set)
- `entryPath` should point to `/apps/<id>/`.

### Permission Consistency
- If app permissions change in `apps.json`, update `light-math-hub/src/data/currentUser.ts` for local dev access.

### Generated/Runtime Files
- Do not hand-edit generated artifacts:
  - `dist/`
  - `.run/`

## 6) Context Memory (Daily + Long-Term)

Memory is file-based:
- Daily notes: `memory/YYYY-MM-DD.md`
- Long-term: `MEMORY.md`

Session start:
1. Read `MEMORY.md` if present.
2. Read `memory/YYYY-MM-DD.md` for today and yesterday if present.

Session end:
1. Append concise summary to today's note:
   - what changed
   - key decisions
   - open issues
   - next actions
2. Promote stable items into `MEMORY.md`.

Never store secrets in memory files.

## 7) Commands You Will Use

Hub:
- `cd light-math-hub && npm install`
- `cd light-math-hub && npm run dev`
- `cd light-math-hub && npm run build`

Apps:
- `cd light-maths && npm run list:apps`
- `cd light-maths && npm run build:all`
- `cd light-maths && ./start-frontend.sh`
- `cd light-maths && ./start-api.sh`
- `cd light-maths && ./start.sh`
- `cd light-maths && ./stop.sh`

Deployment:
- `cd /Users/lee/git/math && ./scripts/deploy-math-chat1.sh`

## 8) Verification Checklist Before Handoff

- Build checks:
  - `cd light-math-hub && npm run build`
  - `cd light-maths && npm run build:all`
- Manual checks:
  - Hub list page (`/`)
  - App detail page (`/app/<id>`)
  - Launch redirect (`/run/<id>`)
  - Spotlight page (`/apps/<id>/game-spotlight.html`)

## 9) Scope and Non-Goals

- Keep changes localized to Hub, app host, or specific app.
- Do not change `/apps/<id>/` path conventions unless explicitly requested.
- Avoid cross-project refactors unless required by the task.
