# AGENTS.md - light-learning

This file is the working guide for Codex in this repository.

## 1) Project Snapshot

- Repo: `learning`
- Type: multi-project frontend repo for multi-subject learning apps
- Main modules:
  - `light-learning-hub`: Learning Shell frontend (React + Vite)
  - `light-learning-apps`: learning app collection, templates, static build host scripts, optional API gateway
- Production domain: `learning.chat1.co`

## 2) Tech Stack and Runtime

- Frontend stack: React 18 + TypeScript + Vite
- Package manager: npm (`package-lock.json` in subprojects)
- No root workspace scripts; run commands inside subproject folders.

Default local ports:
- Hub dev server: `5173`
- Apps static host: `5174`
- Apps API gateway: `7060`

## 3) Architecture (Request Flow)

1. User opens Learning Shell (`light-learning-hub`) at `/`.
2. Shell lists subjects (`/math`, `/english`) and subject pages list apps from `light-learning-hub/src/data/apps.json`.
3. Hub proxies:
   - `/apps/*` -> apps static host (`LIGHT_LEARNING_APPS_HOST_URL`, default `http://localhost:5174`)
   - `/api/apps/*` -> API gateway (`LIGHT_LEARNING_APPS_API_GATEWAY_URL`, default `http://localhost:7060`)
4. Launch flow:
   - Hub route `/run/:id` redirects to `entryPath` (usually `/apps/<id>/`)
5. Each app is built into `light-learning-apps/dist/apps/<id>/`.

## 4) High-Value Paths

- Root overview: `README.md`
- Project ethos: `SOUL.md`
- Deploy script: `scripts/deploy-learning-chat1.sh`
- Hub:
  - `light-learning-hub/src/App.tsx`
  - `light-learning-hub/src/data/apps.json`
  - `light-learning-hub/src/data/currentUser.ts`
  - `light-learning-hub/vite.config.ts`
- Apps host:
  - `light-learning-apps/scripts/build-all.mjs`
  - `light-learning-apps/server/gateway.mjs`
  - `light-learning-apps/docs/light-app-standard.md`
  - `light-learning-apps/templates/light-app/*`
- Sample app:
  - `light-learning-apps/apps/fraction-lab/*`

## 5) Core Contracts to Preserve

### App Packaging Contract
- Every app lives in `light-learning-apps/apps/<id>/`.
- Every app has `light-app.json` with at least: `id`, `name`, `version`, `description`, `entry`.
- Vite `base` must stay `/apps/<id>/`.
- Build output must stay `light-learning-apps/dist/apps/<id>/`.
- Multi-entry build should include `index.html` and `game-spotlight.html`.

### Hub Registry Contract
- Hub only shows what is declared in `light-learning-hub/src/data/apps.json`.
- App is visible only when all are true:
  - `enabled === true`
  - `listed !== false`
  - user has at least one required permission (if permissions are set)
- `entryPath` should point to `/apps/<id>/`.

### Permission Consistency
- If app permissions change in `apps.json`, update `light-learning-hub/src/data/currentUser.ts` for local dev access.

### Generated/Runtime Files
- Do not hand-edit generated artifacts:
  - `dist/`
  - `.run/`

## 6) Every Session

Before doing anything else:

1. Read `SOUL.md` — this is who you are.
2. Read `memory/YYYY-MM-DD.md` for today and yesterday if present.
3. If in MAIN SESSION (direct chat with the human), also read `MEMORY.md` if present.

## 7) Context Memory (Daily + Long-Term)

Memory is file-based:
- Daily notes: `memory/YYYY-MM-DD.md`
- Long-term: `MEMORY.md`

Session end:
1. Append concise summary to today's note:
   - what changed
   - key decisions
   - open issues
   - next actions
2. Promote stable items into `MEMORY.md`.

Never store secrets in memory files.

## 8) Commands You Will Use

Hub:
- `cd light-learning-hub && npm install`
- `cd light-learning-hub && npm run dev`
- `cd light-learning-hub && npm run build`

Apps:
- `cd light-learning-apps && npm run list:apps`
- `cd light-learning-apps && npm run build:all`
- `cd light-learning-apps && ./start-frontend.sh`
- `cd light-learning-apps && ./start-api.sh`
- `cd light-learning-apps && ./start.sh`
- `cd light-learning-apps && ./stop.sh`

Deployment:
- `cd /Users/lee/git/learning && ./scripts/deploy-learning-chat1.sh`

## 9) Verification Checklist Before Handoff

- Build checks:
  - `cd light-learning-hub && npm run build`
  - `cd light-learning-apps && npm run build:all`
- Manual checks:
  - Learning home (`/`)
  - Subject pages (`/math`, `/english`)
  - App detail page (`/app/<id>`)
  - Launch redirect (`/run/<id>`)
  - Spotlight page (`/apps/<id>/game-spotlight.html`)

## 10) Scope and Non-Goals

- Keep changes localized to Hub, app host, or specific app.
- Do not change `/apps/<id>/` path conventions unless explicitly requested.
- Avoid cross-project refactors unless required by the task.

## 11) Frontend Design Guide

When doing frontend design in this repo, prefer visual communication over explanatory UI.

- Reduce instructional text — trust the visual.
- Bias toward visual meaning over abstract intimidation.
- The structure should communicate itself before labels explain it.
- Remove or shrink section labels when layout, spacing, motion, and grouping already make the hierarchy clear.
- Avoid badges, helper subtitles, and preview announcements if the story, animation, or state transition already carries the meaning.
- Let important moments emerge visually; do not over-announce them in text.
