# Cube Main Axis Page 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third cube page that helps learners discover the main axis inside cube nets, especially the first six `1 + 4 + 1` cube nets.

**Architecture:** Keep `cube-surface-lab` as a single React + Vite app, but move reusable net geometry into focused model files before adding the page. Page 3 should reuse the existing 11 cube-net definitions and render a new "axis lens" interaction: learners choose a four-face spine, see the two remaining faces become caps, and fold the spine into a cube belt.

**Tech Stack:** React 18, TypeScript, Vite, CSS, local pure geometry utilities

---

## Product Intent

当前 page 2 已经能展示 11 种正方体展开图，并通过剪边和门式开合说明“这些形状能折成正方体”。Page 3 要补上一个更概念化的学习问题：

- 在展开图里，哪里是能围成正方体侧面的一条主轴？
- 为什么前 6 种展开图很容易看成 `1 + 4 + 1`？
- 剩余两个正方形为什么不是“多出来的”，而是盖到主轴两侧的两个面？

Page 3 不做考试式判断。它应该像一副透明镜片：点选、拖动、折起后，结构自己说话。

## Learning Model

### Definitions

- **Main axis / 主轴:** four edge-connected square faces forming a straight row or straight column. In the first six nets, this is the visual center of `1 + 4 + 1`.
- **Belt / 腰带:** the four main-axis faces after folding, wrapping around the cube as four side faces.
- **Caps / 盖面:** the two faces outside the axis. They attach to the belt and close the remaining two opposite sides.
- **Anchor order:** the four axis faces in left-to-right or top-to-bottom order. This order drives the fold animation.

### Scope

- Page 3 focuses first on `net-01` through `net-06`, because they are the clean `1 + 4 + 1` family.
- Page 3 may still show all 11 thumbnails, but `net-07` through `net-11` should be labeled as "try later" or "not a straight main-axis net" in this page.
- Do not remove page 1 or page 2 behavior.

## File Structure

**Files to create**

- `light-learning-apps/apps/cube-surface-lab/src/netModel.ts`
  - Owns face ids, edge ids, cube net input data, `buildCubeNetDemo`, and pure helpers.
- `light-learning-apps/apps/cube-surface-lab/src/mainAxisModel.ts`
  - Defines axis metadata for the first six nets and helpers for validating selected cells.
- `light-learning-apps/apps/cube-surface-lab/src/CubeMainAxisPage.tsx`
  - Renders page 3 interaction.

**Files to modify**

- `light-learning-apps/apps/cube-surface-lab/src/main.tsx`
  - Imports shared model data and registers page 3 in the tab state.
- `light-learning-apps/apps/cube-surface-lab/src/styles.css`
  - Adds page 3 layout, net grid, axis/cap visual states, and fold controls.
- `light-learning-apps/apps/cube-surface-lab/src/game-spotlight.tsx`
  - Updates the spotlight copy to mention the new main-axis page.
- `light-learning-apps/apps/cube-surface-lab/README.md`
  - Updates the feature summary.

---

### Task 1: Extract Shared Cube Net Model

**Files:**
- Create: `light-learning-apps/apps/cube-surface-lab/src/netModel.ts`
- Modify: `light-learning-apps/apps/cube-surface-lab/src/main.tsx`

- [ ] **Step 1: Move shared types and constants**

Move these definitions from `main.tsx` into `netModel.ts` and export them:

```ts
export type FaceId = "front" | "back" | "up" | "down" | "left" | "right";

export type Point = {
  x: number;
  y: number;
};

export type EdgeDef = {
  id: string;
  label: string;
  start: Point;
  end: Point;
  faces: [FaceId, FaceId];
};

export type NetDemoInput = {
  id: string;
  name: string;
  cells: Point[];
};

export type NetDemo = {
  id: string;
  name: string;
  cells: Point[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; centerX: number; centerY: number };
  facePositions: Record<FaceId, Point>;
  hingeEdges: string[];
  cutEdges: string[];
};
```

Also move and export `FACE_IDS`, `FACE_LABELS`, `EDGE_DEFS`, `EDGE_MAP`, `FACE_EDGE_IDS`, `CUBE_NET_INPUTS`, `CUBE_NET_DEMOS`, `keyOf`, and `normalizeCells`.

- [ ] **Step 2: Keep geometry helpers pure**

Move these helper functions into `netModel.ts`:

```ts
export function keyOf(point: Point): string {
  return `${point.x},${point.y}`;
}

export function normalizeCells(cells: Point[]): Point[] {
  const minX = Math.min(...cells.map((cell) => cell.x));
  const minY = Math.min(...cells.map((cell) => cell.y));
  return cells.map((cell) => ({ x: cell.x - minX, y: cell.y - minY }));
}
```

Move the existing orientation helpers with the same behavior. Keep names stable where possible so page 2 remains unchanged after import replacement.

- [ ] **Step 3: Replace local definitions in `main.tsx`**

At the top of `main.tsx`, import the moved definitions:

```ts
import {
  CUBE_NET_DEMOS,
  EDGE_DEFS,
  EDGE_MAP,
  FACE_EDGE_IDS,
  FACE_IDS,
  FACE_LABELS,
  type EdgeDef,
  type FaceId,
  type NetDemo,
  type Point
} from "./netModel";
```

Delete the duplicate local declarations after confirming TypeScript can resolve all references.

- [ ] **Step 4: Verify unchanged behavior**

Run:

```bash
cd light-learning-apps/apps/cube-surface-lab
npm run build
```

Expected: the TypeScript build and Vite build pass. Page 1 and page 2 should render the same as before.

---

### Task 2: Define Main Axis Data

**Files:**
- Create: `light-learning-apps/apps/cube-surface-lab/src/mainAxisModel.ts`

- [ ] **Step 1: Add axis metadata types**

Create:

```ts
import { CUBE_NET_DEMOS, keyOf, type NetDemo, type Point } from "./netModel";

export type AxisDirection = "horizontal" | "vertical";

export type MainAxisNet = {
  netId: string;
  axisDirection: AxisDirection;
  axisCells: Point[];
  capCells: Point[];
  note: string;
};
```

- [ ] **Step 2: Encode the first six `1 + 4 + 1` nets**

Use normalized coordinates from `CUBE_NET_INPUTS`. For the current data, the first six nets all normalize into a four-cell vertical axis at `x = 1`.

```ts
export const MAIN_AXIS_NETS: MainAxisNet[] = [
  {
    netId: "net-01",
    axisDirection: "vertical",
    axisCells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
    capCells: [{ x: 0, y: 0 }, { x: 2, y: 0 }],
    note: "Two caps attach to the same end of the four-face belt."
  },
  {
    netId: "net-02",
    axisDirection: "vertical",
    axisCells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
    capCells: [{ x: 0, y: 1 }, { x: 2, y: 0 }],
    note: "Caps attach to neighboring positions on the belt."
  },
  {
    netId: "net-03",
    axisDirection: "vertical",
    axisCells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
    capCells: [{ x: 0, y: 2 }, { x: 2, y: 0 }],
    note: "The cap pair is farther apart, but the belt is still the same four-face chain."
  },
  {
    netId: "net-04",
    axisDirection: "vertical",
    axisCells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
    capCells: [{ x: 0, y: 3 }, { x: 2, y: 0 }],
    note: "Caps sit at opposite ends of the belt."
  },
  {
    netId: "net-05",
    axisDirection: "vertical",
    axisCells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
    capCells: [{ x: 0, y: 2 }, { x: 2, y: 1 }],
    note: "Both caps move inward while the belt remains unchanged."
  },
  {
    netId: "net-06",
    axisDirection: "vertical",
    axisCells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
    capCells: [{ x: 0, y: 1 }, { x: 2, y: 1 }],
    note: "Balanced caps make the 1 + 4 + 1 structure easiest to see."
  }
];
```

- [ ] **Step 3: Add lookup helpers**

Add:

```ts
export function getMainAxisForNet(netId: string): MainAxisNet | null {
  return MAIN_AXIS_NETS.find((item) => item.netId === netId) ?? null;
}

export function isAxisCell(axisNet: MainAxisNet, cell: Point): boolean {
  const cellKey = keyOf(cell);
  return axisNet.axisCells.some((axisCell) => keyOf(axisCell) === cellKey);
}

export function isCapCell(axisNet: MainAxisNet, cell: Point): boolean {
  const cellKey = keyOf(cell);
  return axisNet.capCells.some((capCell) => keyOf(capCell) === cellKey);
}

export function getAxisNetDemos(): NetDemo[] {
  const ids = new Set(MAIN_AXIS_NETS.map((item) => item.netId));
  return CUBE_NET_DEMOS.filter((demo) => ids.has(demo.id));
}
```

- [ ] **Step 4: Verify helper assumptions**

Run:

```bash
cd light-learning-apps/apps/cube-surface-lab
npm run build
```

Expected: build passes after adding the pure module, even before the UI uses it.

---

### Task 3: Build Page 3 Interaction

**Files:**
- Create: `light-learning-apps/apps/cube-surface-lab/src/CubeMainAxisPage.tsx`
- Modify: `light-learning-apps/apps/cube-surface-lab/src/styles.css`

- [ ] **Step 1: Create the component shell**

Use this state model:

```tsx
import { useMemo, useState } from "react";
import { CUBE_NET_DEMOS, keyOf, type Point } from "./netModel";
import { getMainAxisForNet, isAxisCell, isCapCell } from "./mainAxisModel";

type AxisMode = "find" | "reveal" | "fold";

export function CubeMainAxisPage() {
  const [selectedId, setSelectedId] = useState("net-01");
  const [mode, setMode] = useState<AxisMode>("find");
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const selectedNet = useMemo(
    () => CUBE_NET_DEMOS.find((demo) => demo.id === selectedId) ?? CUBE_NET_DEMOS[0],
    [selectedId]
  );
  const axisNet = getMainAxisForNet(selectedNet.id);

  const resetSelection = () => {
    setMode("find");
    setSelectedCells([]);
  };

  const toggleCell = (cell: Point) => {
    if (!axisNet || mode !== "find") {
      return;
    }
    const cellKey = keyOf(cell);
    setSelectedCells((prev) =>
      prev.includes(cellKey) ? prev.filter((item) => item !== cellKey) : [...prev, cellKey]
    );
  };

  return (
    <section className="axis-workspace">
      <article className="panel">
        <h2>{selectedNet.name}</h2>
        <p className="judge">
          {axisNet ? `${selectedCells.length} / 4 axis cells selected` : "Choose one of the first six nets."}
        </p>
        <div className="button-row">
          <button type="button" onClick={() => setMode("reveal")} disabled={!axisNet}>
            Reveal Axis
          </button>
          <button type="button" className="btn-muted" onClick={resetSelection}>
            Reset
          </button>
        </div>
      </article>
    </section>
  );
}
```

- [ ] **Step 2: Render the 11-net selector**

Show all 11 nets, but visually mark the first six as axis-ready:

```tsx
<article className="panel axis-picker">
  <div className="panel__head">
    <h2>Main Axis Lens</h2>
    <div className="status-pill">1 + 4 + 1</div>
  </div>
  <div className="axis-net-grid">
    {CUBE_NET_DEMOS.map((demo) => {
      const ready = Boolean(getMainAxisForNet(demo.id));
      return (
        <button
          key={demo.id}
          type="button"
          className={`axis-net-card ${selectedId === demo.id ? "axis-net-card--active" : ""}`}
          onClick={() => {
            setSelectedId(demo.id);
            resetSelection();
          }}
        >
          <span>{demo.name}</span>
          <small>{ready ? "straight axis" : "later pattern"}</small>
        </button>
      );
    })}
  </div>
</article>
```

- [ ] **Step 3: Render the large net board**

Each square gets one of three visual roles: selected axis, revealed axis, or cap.

```tsx
<article className="panel axis-board-panel">
  <div className="panel__head">
    <h2>{selectedNet.name}</h2>
    <div className={`status-pill ${axisNet ? "status-pill--ok" : "status-pill--warn"}`}>
      {axisNet ? "Axis-ready" : "Explore in page 2"}
    </div>
  </div>

  <div className="axis-board">
    {selectedNet.cells.map((cell, index) => {
      const cellKey = keyOf(cell);
      const isSelected = selectedCells.includes(cellKey);
      const axis = axisNet ? isAxisCell(axisNet, cell) : false;
      const cap = axisNet ? isCapCell(axisNet, cell) : false;
      return (
        <button
          key={`${selectedNet.id}-${cellKey}`}
          type="button"
          className={[
            "axis-cell",
            isSelected ? "axis-cell--selected" : "",
            mode !== "find" && axis ? "axis-cell--axis" : "",
            mode !== "find" && cap ? "axis-cell--cap" : ""
          ].join(" ")}
          style={{
            gridColumn: cell.x + 1,
            gridRow: cell.y + 1
          }}
          onClick={() => toggleCell(cell)}
          disabled={!axisNet || mode !== "find"}
        >
          {mode === "find" ? index + 1 : axis ? "axis" : "cap"}
        </button>
      );
    })}
  </div>
</article>
```

- [ ] **Step 4: Add reveal and fold controls**

Controls should be sparse and visual:

```tsx
<div className="button-row">
  <button type="button" onClick={() => setMode("reveal")} disabled={!axisNet}>
    Reveal Axis
  </button>
  <button type="button" onClick={() => setMode("fold")} disabled={!axisNet}>
    Fold Belt
  </button>
  <button type="button" className="btn-muted" onClick={resetSelection}>
    Reset
  </button>
</div>
```

When `selectedCells` exactly matches `axisNet.axisCells`, show `Axis found`. Otherwise show a quiet count such as `2 / 4`.

- [ ] **Step 5: Add fold belt visual**

In `mode === "fold"`, show a simple four-panel belt plus two caps. The belt does not need true 3D; a staged visual is enough for this learning goal:

```tsx
<div className="axis-fold">
  <div className="axis-belt">
    <span>1</span>
    <span>2</span>
    <span>3</span>
    <span>4</span>
  </div>
  <div className="axis-cap axis-cap--top">cap</div>
  <div className="axis-cap axis-cap--bottom">cap</div>
</div>
```

Use CSS transforms so the belt appears to wrap inward slightly. Keep text minimal; color and position should carry the meaning.

- [ ] **Step 6: Style page 3**

Add CSS with fixed square sizing and responsive wrapping:

```css
.axis-workspace {
  display: grid;
  gap: 12px;
  grid-template-columns: 0.85fr 1.2fr;
}

.axis-net-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.axis-board {
  --axis-cell: 68px;
  display: grid;
  justify-content: center;
  gap: 4px;
  grid-template-columns: repeat(4, var(--axis-cell));
  grid-template-rows: repeat(4, var(--axis-cell));
  min-height: 330px;
}

.axis-cell {
  width: var(--axis-cell);
  height: var(--axis-cell);
  border-radius: 8px;
}

.axis-cell--axis {
  background: #d8ecff;
  border: 2px solid rgba(31, 111, 159, 0.72);
}

.axis-cell--cap {
  background: #ffe7c7;
  border: 2px solid rgba(166, 103, 44, 0.58);
}

.axis-cell--selected {
  outline: 3px solid rgba(20, 122, 88, 0.46);
}

.axis-fold {
  min-height: 170px;
  display: grid;
  place-items: center;
  position: relative;
}

.axis-belt {
  display: grid;
  grid-template-columns: repeat(4, 54px);
  transform: perspective(520px) rotateX(54deg);
}
```

Add mobile rules under the existing `@media (max-width: 980px)` and `@media (max-width: 640px)` blocks.

---

### Task 4: Register Page 3

**Files:**
- Modify: `light-learning-apps/apps/cube-surface-lab/src/main.tsx`

- [ ] **Step 1: Import the new page**

```ts
import { CubeMainAxisPage } from "./CubeMainAxisPage";
```

- [ ] **Step 2: Extend page state**

Change:

```ts
const [page, setPage] = useState<"cut" | "nets">("cut");
```

to:

```ts
const [page, setPage] = useState<"cut" | "nets" | "axis">("cut");
```

- [ ] **Step 3: Add the third tab**

Add:

```tsx
<button
  type="button"
  className={`tab-btn ${page === "axis" ? "tab-btn--active" : ""}`}
  onClick={() => setPage("axis")}
>
  Page 3: Main Axis
</button>
```

- [ ] **Step 4: Update hero subtitle**

Use a mapping instead of nested ternaries:

```ts
const pageSubtitle = {
  cut: "Page 1: interactive edge-cut lab. Select edges, simulate scissors, then validate unfolding.",
  nets: "Page 2: all 11 cube nets. Each includes cut edges, step-by-step scissor unfolding, and final shape.",
  axis: "Page 3: find the four-face main axis, then watch the two caps close the cube."
}[page];
```

- [ ] **Step 5: Render the selected page**

Use:

```tsx
{page === "cut" ? (
  <CubeCutExperimentPage />
) : page === "nets" ? (
  <CubeNetsDemoPage />
) : (
  <CubeMainAxisPage />
)}
```

---

### Task 5: Update Supporting Copy

**Files:**
- Modify: `light-learning-apps/apps/cube-surface-lab/src/game-spotlight.tsx`
- Modify: `light-learning-apps/apps/cube-surface-lab/README.md`

- [ ] **Step 1: Update spotlight highlights**

Add one highlight:

```ts
"Adds a main-axis lens for the first six 1 + 4 + 1 cube nets, making the four-face belt and two caps visible."
```

- [ ] **Step 2: Update module list**

Add:

```ts
{
  title: "Module 4: Main Axis",
  caption: "Find the four-face belt inside a cube net and watch the remaining faces become caps."
}
```

- [ ] **Step 3: Update README feature list**

Add:

```md
- Page 3: 观察前 6 种 `1 + 4 + 1` 展开图，找出 4 个正方形组成的主轴，并理解剩余 2 个面如何封闭正方体。
```

---

### Task 6: Verification

**Files:**
- No file changes

- [ ] **Step 1: Build the app**

Run:

```bash
cd light-learning-apps/apps/cube-surface-lab
npm run build
```

Expected: TypeScript and Vite builds pass.

- [ ] **Step 2: Build all apps**

Run:

```bash
cd light-learning-apps
npm run build:all
```

Expected: `cube-surface-lab` builds into `light-learning-apps/dist/apps/cube-surface-lab/`.

- [ ] **Step 3: Manual browser checks**

Run:

```bash
cd light-learning-apps/apps/cube-surface-lab
npm run dev
```

Open the local Vite URL and check:

- Page 1 still cuts and validates a net.
- Page 2 still lists all 11 nets and preserves door angles per face.
- Page 3 tab appears.
- Page 3 `net-01` through `net-06` can reveal a main axis.
- Page 3 `Fold Belt` shows four axis faces as the belt and two cap faces separately.
- Mobile width does not overlap tabs, board cells, or buttons.

## Acceptance Criteria

- Page 3 exists as a third tab named `Page 3: Main Axis`.
- The first six cube nets clearly show a four-face main axis and two cap faces.
- Learners can attempt to select axis cells before revealing the answer.
- The fold view communicates `1 + 4 + 1`: one cap, four-face belt, one cap.
- Page 1 and page 2 behavior remains unchanged.
- `npm run build` passes for `cube-surface-lab`.

## Self-Review

- Spec coverage: the plan directly covers 正方体 page 3, 主轴 interaction, and the first six `1 + 4 + 1` nets.
- Placeholder scan: no implementation step depends on unspecified data or an unnamed component.
- Type consistency: `FaceId`, `Point`, `NetDemo`, `MainAxisNet`, and `AxisMode` are defined before use.
