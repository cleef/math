# Speed Chase Lab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a new light app that visualizes a pursuit problem for elementary students with linked animation, table data, and function curves.

**Architecture:** Create a standalone React + Vite app under `light-maths/apps/speed-chase-lab/`. Use local SVG and CSS for the starfield stage and line chart so the app remains dependency-light and easy to build. Register the app in Hub and grant the local dev user permission.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4

---

### Task 1: App scaffold

**Files:**
- Create: `light-maths/apps/speed-chase-lab/*`

**Step 1: Copy the standard light-app structure**

Create `light-app.json`, `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `game-spotlight.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/game-spotlight.tsx`.

**Step 2: Keep the packaging contract**

Set `light-app.json.id = "speed-chase-lab"`, Vite `base = "/apps/speed-chase-lab/"`, and build output to `light-maths/dist/apps/speed-chase-lab/`.

### Task 2: Lesson interaction

**Files:**
- Modify: `light-maths/apps/speed-chase-lab/src/App.tsx`
- Modify: `light-maths/apps/speed-chase-lab/src/index.css`

**Step 1: Build parameter controls**

Add controls for lead time, human ship speed, and chaser speed with sensible min/max ranges and default values `5 / 40 / 60`.

**Step 2: Build playback logic**

Add `start`, `pause`, and `reset` behavior with a timer-driven `currentTime`. Clamp motion at catch-up time when the chaser is faster, and handle the no-catch case explicitly.

**Step 3: Build linked views**

Render:
- a starfield chase stage
- a live analysis table
- an SVG chart showing `已追赶距离` and `剩余距离`

### Task 3: Spotlight page and Hub integration

**Files:**
- Modify: `light-maths/apps/speed-chase-lab/src/game-spotlight.tsx`
- Modify: `light-math-hub/src/data/apps.json`
- Modify: `light-math-hub/src/data/currentUser.ts`

**Step 1: Add a spotlight page**

Summarize the teaching value, classroom flow, and the key formula idea.

**Step 2: Register the app**

Add a new Hub entry with `enabled`, `listed`, permission, and `/apps/speed-chase-lab/` entry path.

### Task 4: Verification and memory

**Files:**
- Modify: `memory/2026-03-26.md`
- Modify: `MEMORY.md` if a stable convention changes

**Step 1: Build verification**

Run:
- `cd light-math-hub && npm run build`
- `cd light-maths && npm run build:all`

**Step 2: Update daily memory**

Append the new app name, what changed, and next actions if any.
