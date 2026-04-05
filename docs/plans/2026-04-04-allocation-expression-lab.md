# Allocation Expression Lab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a new light app that teaches students allocation word problems in two phases: first watch a concrete distribution process with pause/reset controls, then abstract the same story into correct algebraic expressions and equations, with special focus on avoiding sign-direction mistakes such as `10x + 12` vs `10x - 12`.

**Architecture:** Create a standalone React + Vite app under `light-maths/apps/allocation-expression-lab/`. The app should use lightweight local state, typed scenario data, and an animation state machine to connect natural-language conditions, concrete distribution playback, algebraic expressions, and the final equation. Built-in scenarios should be available immediately, while an optional AI-generated scenario should be fetched through the existing apps API gateway under `/api/apps/allocation-expression-lab/*` so the feature can be enabled without coupling the frontend to a provider-specific SDK. Register the app in Hub and grant the local dev user permission so the lesson can be opened from `/run/allocation-expression-lab`.

**Tech Stack:** React 18, TypeScript, Vite, CSS

---

### Task 1: App scaffold

**Files:**
- Create: `light-maths/apps/allocation-expression-lab/light-app.json`
- Create: `light-maths/apps/allocation-expression-lab/package.json`
- Create: `light-maths/apps/allocation-expression-lab/package-lock.json`
- Create: `light-maths/apps/allocation-expression-lab/tsconfig.json`
- Create: `light-maths/apps/allocation-expression-lab/vite.config.ts`
- Create: `light-maths/apps/allocation-expression-lab/index.html`
- Create: `light-maths/apps/allocation-expression-lab/game-spotlight.html`
- Create: `light-maths/apps/allocation-expression-lab/src/main.tsx`
- Create: `light-maths/apps/allocation-expression-lab/src/App.tsx`
- Create: `light-maths/apps/allocation-expression-lab/src/index.css`
- Create: `light-maths/apps/allocation-expression-lab/src/game-spotlight.tsx`
- Create: `light-maths/apps/allocation-expression-lab/src/scenarios.ts`
- Create: `light-maths/apps/allocation-expression-lab/src/types.ts`
- Create: `light-maths/apps/allocation-expression-lab/light-api.json`

**Step 1: Copy the standard light-app structure**

Use `light-maths/templates/light-app/` as the starting point, then rename metadata and entry content for the new app.

**Step 2: Keep the packaging contract**

Set:
- `light-app.json.id = "allocation-expression-lab"`
- `light-app.json.name = "分配问题表达实验"`
- Vite `base = "/apps/allocation-expression-lab/"`
- build output to `light-maths/dist/apps/allocation-expression-lab/`

**Step 3: Keep the app small and dependency-light**

Do not add extra runtime libraries unless implementation complexity justifies it. The app can be built with React state plus local utility functions.

**Step 4: Reserve an API manifest for AI scenario generation**

Add `light-api.json` so the app can expose a small HTTP endpoint through the existing gateway. If the AI feature is not configured locally, the frontend should still work with built-in scenarios only.

### Task 2: Scenario model and lesson content

**Files:**
- Create: `light-maths/apps/allocation-expression-lab/src/types.ts`
- Create: `light-maths/apps/allocation-expression-lab/src/scenarios.ts`
- Modify: `light-maths/apps/allocation-expression-lab/src/App.tsx`

**Step 1: Define a scenario type that separates story text from algebra meaning**

Use a typed structure similar to:

```ts
type AllocationVariant = {
  sentence: string;
  expression: string;
  explanation: string;
  commonMistake?: {
    expression: string;
    whyWrong: string;
  };
};

type AllocationScenario = {
  id: string;
  theme: "rooms" | "apples" | "custom";
  title: string;
  story: string;
  unknownLabel: string;
  unknownSymbol: "x";
  quantityLabel: string;
  concreteValue: number;
  playback: {
    unitLabel: string;
    firstModeLabel: string;
    secondModeLabel: string;
    firstGroupSize: number;
    secondGroupSize: number;
    firstAdjustment: number;
    firstAdjustmentKind: "leftover-capacity" | "leftover-items";
    secondAdjustment: number;
    secondAdjustmentKind: "need-more-groups";
  };
  variants: [AllocationVariant, AllocationVariant];
  equation: string;
  solvedValue?: number;
  generatedBy?: "builtin" | "ai";
};
```

**Step 2: Seed the first two required scenarios with concrete playable values**

Add at least these two lesson cards:

1. `rooms-basic`
   - Story: 给学生分配房间，如果每间住 10 人，则空闲 12 个床位；如果每间住 6 人，则少 2 个房间。
   - Unknown: 房间数 `x`
   - Concrete demo value: `x = 6`, total students `48`
   - Expressions:
     - `10x - 12`
     - `6(x + 2)`
   - Equation:
     - `10x - 12 = 6(x + 2)`
   - Common mistakes:
     - `10x + 12`
     - `6x - 2`

2. `apples-basic`
   - Story: 给小朋友分苹果，如果每袋装 8 个，还剩 5 个；如果每袋装 10 个，还差 1 袋。
   - Unknown: 袋数 `x`
   - Concrete demo value: `x = 3`, total苹果 `29`
   - Expressions:
     - `8x + 5`
     - `10(x + 1)`
   - Equation:
     - `8x + 5 = 10(x + 1)`
   - Common mistakes:
     - `8x - 5`
     - `10x - 1`

**Step 3: Make the scenario model extensible for AI output**

Keep `scenarios.ts` easy to extend later with seats, books, boats, tables, or team-grouping variants without changing the rendering architecture. The AI endpoint should return the same `AllocationScenario` shape so built-in and generated stories share one renderer.

### Task 3: Scenario selection and AI generation

**Files:**
- Modify: `light-maths/apps/allocation-expression-lab/src/App.tsx`
- Modify: `light-maths/apps/allocation-expression-lab/src/index.css`
- Create: `light-maths/apps/allocation-expression-lab/light-api.json`
- Create: `light-maths/apps/allocation-expression-lab/server/index.mjs`

**Step 1: Build scenario buttons**

Render a top selector with:
- 房间分配
- 苹果分配
- AI 生成新场景

Built-in buttons switch instantly. The AI button opens a small prompt box for theme hints such as “分书”, “分桌子”, “分船”.

**Step 2: Add a gateway-backed AI generation endpoint**

Expose an app-local API route such as:
- `POST /api/apps/allocation-expression-lab/scenario/generate`

The endpoint should:
- accept a short teacher prompt
- ask the model for a single elementary-level allocation story
- normalize the output into the shared `AllocationScenario` schema
- reject malformed output and fall back with a clear error

**Step 3: Keep AI optional and safe**

If no API key or model config is present:
- disable the AI button with explanatory text, or
- show a non-blocking message that only built-in scenarios are available locally

The app must remain fully usable without AI.

### Task 4: Concrete playback lesson

**Files:**
- Modify: `light-maths/apps/allocation-expression-lab/src/App.tsx`
- Modify: `light-maths/apps/allocation-expression-lab/src/index.css`

**Step 1: Make the first learning phase concrete**

The lesson should start from a specific quantity, not from `x`.
For the active scenario:
- show the total concrete amount
- animate the first distribution rule
- animate the second distribution rule

Students should first see “到底发生了什么” before any algebra symbols appear.

**Step 2: Build playback controls**

Add:
- `开始 / 继续`
- `暂停`
- `重置`
- optional progress scrubber if cheap to implement

The distribution process must be interruptible at any time and restart cleanly from step 0.

**Step 3: Animate both distribution conditions explicitly**

For example:
- rooms: assign students into room cards, first under `10` beds per room with `12` empty beds remaining, then under `6` beds per room showing that `x` rooms are not enough and `2` more rooms are needed
- apples: fill bags of `8` with `5` loose apples remaining, then switch to bags of `10` and show that one extra bag is required

Animation can be chip-based or bar-based; it does not need to simulate every single object if grouped motion is clearer.

**Step 4: Keep the concrete amount and algebra linked**

The same concrete amount used in playback should feed the later expression explanation, so students can see that:
- `10x` is capacity before adjustment
- `10x - 12` is actual人数 after removing empty beds
- `10(x + 1)` or `6(x + 2)` comes from changing the group count before multiplying

### Task 5: Core abstraction flow

**Files:**
- Modify: `light-maths/apps/allocation-expression-lab/src/App.tsx`
- Modify: `light-maths/apps/allocation-expression-lab/src/index.css`

**Step 1: Build a two-phase lesson layout**

Render two major phases:
- `Phase A`: 具体数量演示
- `Phase B`: 抽象为未知数表达

Inside `Phase B`, keep three steps:
- `Step 1`: 确定未知数
- `Step 2`: 分别写出两个数量表达式
- `Step 3`: 列出方程并检查

The student should always see which story is active, what the concrete quantity was, and what `x` means in the abstracted version.

**Step 2: Prefer constrained expression assembly over free-form parsing**

Use guided expression building for the first version:
- coefficient picker
- `x` token
- `+` / `-`
- optional parentheses wrapper for `x + n`

This is more robust than a fully free text parser and directly targets the sign-direction teaching goal.

**Step 3: Show “base amount + adjustment meaning” explicitly**

For each condition, split the reasoning into:
- baseline: `每组数量 × 组数`
- adjustment: `空闲 / 剩余 / 多出` means subtract from capacity or add to total depending on sentence meaning
- shortage: `还差 / 少几个组` means the actual group count must increase before multiplying

Each expression card should include a one-line explanation such as:
- `10x` 是总床位数，空闲 12 个床位，所以学生人数是 `10x - 12`
- `x` 个袋子不够，还差 1 袋，所以实际需要按 `x + 1` 袋计算

**Step 4: Build a concrete-to-abstract bridge**

Between playback and algebra, add a short mapping strip:
- 具体演示里的“6 个房间”
- 抽象后的“x 个房间”
- concrete total value
- abstract expression template

This bridge is the teaching centerpiece and prevents the jump from feeling abrupt.

**Step 5: Build a mistake-comparison area**

For each condition, show one common wrong expression after the student answers. Explain the semantic conflict directly, for example:
- `10x + 12` 表示人数比床位还多 12，人更多，不可能出现“空闲 12 个床位”。

### Task 6: Visual validation and feedback

**Files:**
- Modify: `light-maths/apps/allocation-expression-lab/src/App.tsx`
- Modify: `light-maths/apps/allocation-expression-lab/src/index.css`

**Step 1: Add a trial-value checker after abstraction**

Provide a small `x` slider or stepper so students can test sample values. When the expression is correct, the preview and the expression value should stay consistent. When the expression is the common mistake, the preview should visibly contradict the story.

**Step 2: Add completion feedback**

After both expressions are correct:
- reveal the full equation
- optionally show the solved `x`
- summarize the verbal template:
  - `总量 = 每组量 × 组数 ± 调整量`
  - `组数不够时，要先改组数，再乘每组量`

### Task 7: Spotlight page and Hub integration

**Files:**
- Modify: `light-maths/apps/allocation-expression-lab/src/game-spotlight.tsx`
- Modify: `light-math-hub/src/data/apps.json`
- Modify: `light-math-hub/src/data/currentUser.ts`

**Step 1: Add a spotlight page**

Summarize:
- why allocation problems are easy to misread
- how the app teaches from concrete playback to abstract expression
- how built-in and AI-generated stories can be used in class

**Step 2: Register the app in Hub**

Add a new app entry with:
- `id = "allocation-expression-lab"`
- Chinese name and description focused on “分配问题”和“正确列式”
- `tags = ["代数"]` or `["应用题"]`
- `enabled = true`
- `listed = true`
- `entryPath = "/apps/allocation-expression-lab/"`
- permission `light.app.allocation.expression.lab`

**Step 3: Update local dev permissions**

Append `light.app.allocation.expression.lab` to `light-math-hub/src/data/currentUser.ts` so the app is visible in local development.

### Task 8: Verification and memory

**Files:**
- Modify: `memory/2026-04-04.md`
- Modify: `MEMORY.md` only if a stable cross-session convention changes

**Step 1: Build verification**

Run:
- `cd light-math-hub && npm run build`
- `cd light-maths && npm run build:all`

**Step 2: Manual checks**

Verify:
- Hub list page shows the new app
- `/run/allocation-expression-lab` redirects correctly
- built-in room and apple scenarios both support concrete playback, pause, and reset
- AI scenario generation degrades gracefully when local config is absent
- when AI config is present, generated scenarios render through the same playback and abstraction flow
- the seeded scenarios both teach the intended expression direction
- `game-spotlight.html` loads

**Step 3: Update daily memory**

Append:
- what was implemented
- the decision to use concrete playback before abstraction
- the AI scenario generation contract and fallback behavior
- follow-up ideas such as adding more scenario packs
