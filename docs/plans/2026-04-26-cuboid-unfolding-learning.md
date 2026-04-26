# Cuboid Unfolding Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Design and implement a cuboid unfolding lesson that extends the cube net experience from equal squares to three face-size pairs: top/bottom, front/back, left/right.

**Architecture:** Add a new cuboid page inside `cube-surface-lab` rather than creating a separate app, because the concept is a direct sequel to cube unfolding. Reuse the existing cutting/unfolding language, but introduce a cuboid-specific data model where each face has dimensions and every valid net must preserve matching opposite faces.

**Tech Stack:** React 18, TypeScript, Vite, CSS, SVG/HTML transforms

---

## Product Intent

正方体展开图的难点是“6 个相同正方形如何连成一个能折回去的整体”。长方体的难点更进一步：

- 6 个面不再都一样，而是 3 对相等的长方形。
- 展开图不仅要连通，还要让相邻边长度匹配。
- 学生需要看到 `长 x 宽`、`长 x 高`、`宽 x 高` 三类面如何成对出现。

这个页面应当把长方体展开学习设计成正方体之后的自然延伸：先认识三类面，再展开，再尝试组合。

## Learning Model

Use dimensions:

- `length = 4`
- `width = 2`
- `height = 3`

Faces:

- `front/back`: `length x height`
- `top/bottom`: `length x width`
- `left/right`: `width x height`

The learner should visually understand:

- Opposite faces have equal size and never share an edge on the folded cuboid.
- Adjacent faces must share a same-length edge.
- A cuboid net can look less symmetric than a cube net because face rectangles have different proportions.

## Page Scope

Add a fourth page to the existing app:

- Page 1: cube cut lab
- Page 2: 11 cube nets
- Page 3: cube main axis
- Page 4: cuboid unfolding

Page 4 should be useful even if Page 3 has not been implemented yet, but when both exist the tab order should follow this sequence.

## File Structure

**Files to create**

- `light-learning-apps/apps/cube-surface-lab/src/cuboidModel.ts`
  - Cuboid dimensions, face metadata, sample net definitions, edge-length validation helpers.
- `light-learning-apps/apps/cube-surface-lab/src/CuboidUnfoldingPage.tsx`
  - Page 4 interaction.

**Files to modify**

- `light-learning-apps/apps/cube-surface-lab/src/main.tsx`
  - Adds the cuboid page tab and page state.
- `light-learning-apps/apps/cube-surface-lab/src/styles.css`
  - Adds cuboid face sizing, pair colors, net board, and validation styles.
- `light-learning-apps/apps/cube-surface-lab/src/game-spotlight.tsx`
  - Mentions cuboid progression.
- `light-learning-apps/apps/cube-surface-lab/README.md`
  - Updates the app feature summary.

---

### Task 1: Add Cuboid Data Model

**Files:**
- Create: `light-learning-apps/apps/cube-surface-lab/src/cuboidModel.ts`

- [ ] **Step 1: Define cuboid types**

Create:

```ts
export type CuboidFaceId = "front" | "back" | "top" | "bottom" | "left" | "right";

export type CuboidFaceKind = "length-height" | "length-width" | "width-height";

export type CuboidDimensions = {
  length: number;
  width: number;
  height: number;
};

export type CuboidFace = {
  id: CuboidFaceId;
  label: string;
  kind: CuboidFaceKind;
  pairId: CuboidFaceId;
  size: {
    w: number;
    h: number;
  };
};

export type CuboidNetCell = {
  faceId: CuboidFaceId;
  x: number;
  y: number;
  rotate?: boolean;
};

export type CuboidNet = {
  id: string;
  name: string;
  cells: CuboidNetCell[];
  teachingNote: string;
};
```

- [ ] **Step 2: Add dimensions and faces**

Use fixed teaching dimensions:

```ts
export const CUBOID_DIMENSIONS: CuboidDimensions = {
  length: 4,
  width: 2,
  height: 3
};

export const CUBOID_FACES: CuboidFace[] = [
  {
    id: "front",
    label: "Front",
    kind: "length-height",
    pairId: "back",
    size: { w: CUBOID_DIMENSIONS.length, h: CUBOID_DIMENSIONS.height }
  },
  {
    id: "back",
    label: "Back",
    kind: "length-height",
    pairId: "front",
    size: { w: CUBOID_DIMENSIONS.length, h: CUBOID_DIMENSIONS.height }
  },
  {
    id: "top",
    label: "Top",
    kind: "length-width",
    pairId: "bottom",
    size: { w: CUBOID_DIMENSIONS.length, h: CUBOID_DIMENSIONS.width }
  },
  {
    id: "bottom",
    label: "Bottom",
    kind: "length-width",
    pairId: "top",
    size: { w: CUBOID_DIMENSIONS.length, h: CUBOID_DIMENSIONS.width }
  },
  {
    id: "left",
    label: "Left",
    kind: "width-height",
    pairId: "right",
    size: { w: CUBOID_DIMENSIONS.width, h: CUBOID_DIMENSIONS.height }
  },
  {
    id: "right",
    label: "Right",
    kind: "width-height",
    pairId: "left",
    size: { w: CUBOID_DIMENSIONS.width, h: CUBOID_DIMENSIONS.height }
  }
];
```

- [ ] **Step 3: Add sample nets**

Start with three curated nets, not a full enumeration:

```ts
export const CUBOID_NETS: CuboidNet[] = [
  {
    id: "cuboid-cross",
    name: "Cross net",
    teachingNote: "A familiar cross shape: four side faces form a belt, top and bottom close it.",
    cells: [
      { faceId: "left", x: 0, y: 1 },
      { faceId: "front", x: 1, y: 1 },
      { faceId: "right", x: 2, y: 1 },
      { faceId: "back", x: 3, y: 1 },
      { faceId: "top", x: 1, y: 0 },
      { faceId: "bottom", x: 1, y: 2 }
    ]
  },
  {
    id: "cuboid-offset-caps",
    name: "Offset caps",
    teachingNote: "The caps move along the belt, but their edge lengths still match the face they touch.",
    cells: [
      { faceId: "left", x: 0, y: 1 },
      { faceId: "front", x: 1, y: 1 },
      { faceId: "right", x: 2, y: 1 },
      { faceId: "back", x: 3, y: 1 },
      { faceId: "top", x: 2, y: 0 },
      { faceId: "bottom", x: 0, y: 2 }
    ]
  },
  {
    id: "cuboid-rotated-side",
    name: "Turned side face",
    teachingNote: "A rectangle may rotate in the flat net, but shared edge lengths must still agree.",
    cells: [
      { faceId: "front", x: 1, y: 1 },
      { faceId: "top", x: 1, y: 0 },
      { faceId: "bottom", x: 1, y: 2 },
      { faceId: "left", x: 0, y: 1, rotate: true },
      { faceId: "right", x: 2, y: 1, rotate: true },
      { faceId: "back", x: 3, y: 1 }
    ]
  }
];
```

- [ ] **Step 4: Add face lookup helper**

```ts
export function getCuboidFace(faceId: CuboidFaceId): CuboidFace {
  const face = CUBOID_FACES.find((item) => item.id === faceId);
  if (!face) {
    throw new Error(`Unknown cuboid face: ${faceId}`);
  }
  return face;
}
```

- [ ] **Step 5: Verify compile**

Run:

```bash
cd light-learning-apps/apps/cube-surface-lab
npm run build
```

Expected: build passes after adding the model file.

---

### Task 2: Build Face Pair Recognition

**Files:**
- Create: `light-learning-apps/apps/cube-surface-lab/src/CuboidUnfoldingPage.tsx`
- Modify: `light-learning-apps/apps/cube-surface-lab/src/styles.css`

- [ ] **Step 1: Create the component shell**

```tsx
import { useMemo, useState } from "react";
import { CUBOID_FACES, CUBOID_NETS, getCuboidFace, type CuboidFaceId } from "./cuboidModel";

type CuboidMode = "pairs" | "unfold" | "build";

export function CuboidUnfoldingPage() {
  const [mode, setMode] = useState<CuboidMode>("pairs");
  const [selectedNetId, setSelectedNetId] = useState(CUBOID_NETS[0].id);
  const [activeFaceId, setActiveFaceId] = useState<CuboidFaceId>("front");
  const selectedNet = useMemo(
    () => CUBOID_NETS.find((net) => net.id === selectedNetId) ?? CUBOID_NETS[0],
    [selectedNetId]
  );
  const activeFace = getCuboidFace(activeFaceId);

  return (
    <section className="cuboid-workspace">
      <article className="panel">
        <div className="panel__head">
          <h2>{selectedNet.name}</h2>
          <div className="status-pill">{mode}</div>
        </div>
        <p className="judge">
          {CUBOID_FACES.length} faces, active face {activeFace.label}.
        </p>
      </article>
    </section>
  );
}
```

- [ ] **Step 2: Add the three face-pair cards**

Render three paired groups:

```tsx
<article className="panel cuboid-pairs">
  <div className="panel__head">
    <h2>Three Face Pairs</h2>
    <div className="status-pill">4 x 2 x 3</div>
  </div>
  <div className="cuboid-pair-grid">
    {CUBOID_FACES.map((face) => (
      <button
        key={face.id}
        type="button"
        className={`cuboid-face-card cuboid-face-card--${face.kind} ${
          activeFaceId === face.id ? "cuboid-face-card--active" : ""
        }`}
        onClick={() => setActiveFaceId(face.id)}
      >
        <strong>{face.label}</strong>
        <span>{face.size.w} x {face.size.h}</span>
      </button>
    ))}
  </div>
</article>
```

- [ ] **Step 3: Show the active face and its opposite**

```tsx
const activeFace = getCuboidFace(activeFaceId);
const pairedFace = getCuboidFace(activeFace.pairId);
```

Render:

```tsx
<div className="cuboid-pair-focus">
  <div className={`cuboid-rect cuboid-rect--${activeFace.kind}`}>
    {activeFace.label}
  </div>
  <div className={`cuboid-rect cuboid-rect--${pairedFace.kind}`}>
    {pairedFace.label}
  </div>
</div>
```

Use equal visual dimensions for the pair so the equality is immediate.

- [ ] **Step 4: Add pair-mode CSS**

```css
.cuboid-workspace {
  display: grid;
  gap: 12px;
  grid-template-columns: 0.88fr 1.2fr;
}

.cuboid-pair-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.cuboid-face-card {
  min-height: 74px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: var(--ink);
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(38, 72, 57, 0.24);
}

.cuboid-face-card--length-height,
.cuboid-rect--length-height {
  background: #fff0cf;
}

.cuboid-face-card--length-width,
.cuboid-rect--length-width {
  background: #dceeff;
}

.cuboid-face-card--width-height,
.cuboid-rect--width-height {
  background: #dff2e7;
}

.cuboid-face-card--active {
  outline: 3px solid rgba(31, 111, 159, 0.36);
}
```

---

### Task 3: Build Cuboid Net Viewer

**Files:**
- Modify: `light-learning-apps/apps/cube-surface-lab/src/CuboidUnfoldingPage.tsx`
- Modify: `light-learning-apps/apps/cube-surface-lab/src/styles.css`

- [ ] **Step 1: Add mode controls**

```tsx
<div className="button-row">
  <button type="button" onClick={() => setMode("pairs")}>
    Face Pairs
  </button>
  <button type="button" onClick={() => setMode("unfold")}>
    Unfold Nets
  </button>
  <button type="button" onClick={() => setMode("build")}>
    Build Check
  </button>
</div>
```

- [ ] **Step 2: Add net selector**

```tsx
<div className="cuboid-net-tabs">
  {CUBOID_NETS.map((net) => (
    <button
      key={net.id}
      type="button"
      className={`cuboid-net-tab ${selectedNetId === net.id ? "cuboid-net-tab--active" : ""}`}
      onClick={() => setSelectedNetId(net.id)}
    >
      {net.name}
    </button>
  ))}
</div>
```

- [ ] **Step 3: Render rectangles with real proportions**

Use a unit scale that fits mobile and desktop:

```tsx
const unit = 32;
```

For every net cell:

```tsx
{selectedNet.cells.map((cell) => {
  const face = getCuboidFace(cell.faceId);
  const width = (cell.rotate ? face.size.h : face.size.w) * unit;
  const height = (cell.rotate ? face.size.w : face.size.h) * unit;
  return (
    <div
      key={`${selectedNet.id}-${cell.faceId}`}
      className={`cuboid-net-face cuboid-net-face--${face.kind}`}
      style={{
        gridColumn: cell.x + 1,
        gridRow: cell.y + 1,
        width,
        height
      }}
    >
      <strong>{face.label}</strong>
      <span>{face.size.w} x {face.size.h}</span>
    </div>
  );
})}
```

- [ ] **Step 4: Add net board CSS**

```css
.cuboid-net-board {
  display: grid;
  justify-content: center;
  align-items: center;
  gap: 6px;
  grid-template-columns: repeat(4, 132px);
  grid-template-rows: repeat(3, 104px);
  min-height: 390px;
  overflow: auto;
}

.cuboid-net-face {
  border-radius: 8px;
  border: 2px solid rgba(28, 61, 50, 0.34);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 4px;
  box-shadow: 0 8px 14px rgba(25, 62, 49, 0.12);
}

.cuboid-net-face span {
  font-size: 0.82rem;
  color: #435f55;
}
```

- [ ] **Step 5: Keep note text minimal**

Show only `selectedNet.teachingNote` below the board in `.judge`. Do not add long instructional paragraphs.

---

### Task 4: Add Edge-Length Build Check

**Files:**
- Modify: `light-learning-apps/apps/cube-surface-lab/src/cuboidModel.ts`
- Modify: `light-learning-apps/apps/cube-surface-lab/src/CuboidUnfoldingPage.tsx`

- [ ] **Step 1: Add edge length helper**

In `cuboidModel.ts`:

```ts
export type CuboidEdgeSide = "top" | "right" | "bottom" | "left";

export function getCuboidFaceSideLength(faceId: CuboidFaceId, side: CuboidEdgeSide, rotate = false): number {
  const face = getCuboidFace(faceId);
  const width = rotate ? face.size.h : face.size.w;
  const height = rotate ? face.size.w : face.size.h;
  return side === "top" || side === "bottom" ? width : height;
}
```

- [ ] **Step 2: Add adjacency detection**

```ts
export type CuboidAdjacency = {
  a: CuboidNetCell;
  b: CuboidNetCell;
  aSide: CuboidEdgeSide;
  bSide: CuboidEdgeSide;
  lengthMatches: boolean;
};

export function getCuboidAdjacencies(net: CuboidNet): CuboidAdjacency[] {
  const results: CuboidAdjacency[] = [];
  for (const a of net.cells) {
    for (const b of net.cells) {
      if (a.faceId >= b.faceId) {
        continue;
      }
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      let aSide: CuboidEdgeSide | null = null;
      let bSide: CuboidEdgeSide | null = null;
      if (dx === 1 && dy === 0) {
        aSide = "right";
        bSide = "left";
      } else if (dx === -1 && dy === 0) {
        aSide = "left";
        bSide = "right";
      } else if (dx === 0 && dy === 1) {
        aSide = "bottom";
        bSide = "top";
      } else if (dx === 0 && dy === -1) {
        aSide = "top";
        bSide = "bottom";
      }
      if (!aSide || !bSide) {
        continue;
      }
      const aLength = getCuboidFaceSideLength(a.faceId, aSide, a.rotate);
      const bLength = getCuboidFaceSideLength(b.faceId, bSide, b.rotate);
      results.push({
        a,
        b,
        aSide,
        bSide,
        lengthMatches: aLength === bLength
      });
    }
  }
  return results;
}
```

- [ ] **Step 3: Render validation chips**

In build mode:

```tsx
const adjacencies = getCuboidAdjacencies(selectedNet);
```

Render:

```tsx
<div className="cuboid-check-list">
  {adjacencies.map((item) => (
    <div
      key={`${item.a.faceId}-${item.b.faceId}`}
      className={`cuboid-check ${item.lengthMatches ? "cuboid-check--ok" : "cuboid-check--bad"}`}
    >
      <strong>{item.a.faceId} - {item.b.faceId}</strong>
      <span>{item.lengthMatches ? "edge lengths match" : "edge lengths do not match"}</span>
    </div>
  ))}
</div>
```

- [ ] **Step 4: Add validation CSS**

```css
.cuboid-check-list {
  display: grid;
  gap: 8px;
}

.cuboid-check {
  border-radius: 8px;
  padding: 9px 10px;
  display: grid;
  gap: 3px;
  border: 1px solid rgba(38, 72, 57, 0.22);
  background: rgba(255, 255, 255, 0.74);
}

.cuboid-check--ok {
  border-color: rgba(20, 122, 88, 0.38);
  background: rgba(215, 247, 235, 0.82);
}

.cuboid-check--bad {
  border-color: rgba(127, 47, 47, 0.38);
  background: rgba(255, 226, 226, 0.82);
}
```

---

### Task 5: Add Simple Fold Preview

**Files:**
- Modify: `light-learning-apps/apps/cube-surface-lab/src/CuboidUnfoldingPage.tsx`
- Modify: `light-learning-apps/apps/cube-surface-lab/src/styles.css`

- [ ] **Step 1: Render a proportional folded cuboid**

Add a preview next to the net board:

```tsx
<div className="cuboid-fold-preview" aria-label="folded cuboid preview">
  <div className="cuboid-solid">
    <div className="cuboid-solid__face cuboid-solid__face--front">4 x 3</div>
    <div className="cuboid-solid__face cuboid-solid__face--top">4 x 2</div>
    <div className="cuboid-solid__face cuboid-solid__face--right">2 x 3</div>
  </div>
</div>
```

- [ ] **Step 2: Add proportional solid CSS**

```css
.cuboid-fold-preview {
  min-height: 230px;
  display: grid;
  place-items: center;
}

.cuboid-solid {
  position: relative;
  width: 192px;
  height: 144px;
  transform-style: preserve-3d;
  transform: rotateX(-18deg) rotateY(28deg);
}

.cuboid-solid__face {
  position: absolute;
  display: grid;
  place-items: center;
  border: 1.5px solid rgba(24, 47, 38, 0.36);
  font-weight: 700;
}

.cuboid-solid__face--front {
  width: 192px;
  height: 144px;
  background: #fff0cf;
}

.cuboid-solid__face--top {
  width: 192px;
  height: 96px;
  background: #dceeff;
  transform: rotateX(90deg);
  transform-origin: top;
}

.cuboid-solid__face--right {
  width: 96px;
  height: 144px;
  right: -96px;
  background: #dff2e7;
  transform: rotateY(90deg);
  transform-origin: left;
}
```

- [ ] **Step 3: Keep fold preview non-blocking**

The preview should not be the source of truth. The net board and edge-length chips teach the structure; the solid only gives a final spatial anchor.

---

### Task 6: Register Page 4

**Files:**
- Modify: `light-learning-apps/apps/cube-surface-lab/src/main.tsx`

- [ ] **Step 1: Import the page**

```ts
import { CuboidUnfoldingPage } from "./CuboidUnfoldingPage";
```

- [ ] **Step 2: Extend page state**

If Page 3 is already implemented:

```ts
const [page, setPage] = useState<"cut" | "nets" | "axis" | "cuboid">("cut");
```

If Page 3 is not implemented yet:

```ts
const [page, setPage] = useState<"cut" | "nets" | "cuboid">("cut");
```

- [ ] **Step 3: Add the tab**

```tsx
<button
  type="button"
  className={`tab-btn ${page === "cuboid" ? "tab-btn--active" : ""}`}
  onClick={() => setPage("cuboid")}
>
  Page 4: Cuboid Nets
</button>
```

- [ ] **Step 4: Update subtitle mapping**

If Page 3 is already present:

```ts
const pageSubtitle = {
  cut: "Page 1: interactive edge-cut lab. Select edges, simulate scissors, then validate unfolding.",
  nets: "Page 2: all 11 cube nets. Each includes cut edges, step-by-step scissor unfolding, and final shape.",
  axis: "Page 3: find the four-face main axis, then watch the two caps close the cube.",
  cuboid: "Page 4: unfold a cuboid by matching three pairs of rectangles and their shared edge lengths."
}[page];
```

---

### Task 7: Update Docs and Spotlight

**Files:**
- Modify: `light-learning-apps/apps/cube-surface-lab/src/game-spotlight.tsx`
- Modify: `light-learning-apps/apps/cube-surface-lab/README.md`

- [ ] **Step 1: Update spotlight highlights**

Add:

```ts
"Extends cube nets to cuboid nets by showing three equal face pairs and matching edge lengths."
```

- [ ] **Step 2: Add a cuboid module card**

```ts
{
  title: "Module 5: Cuboid Nets",
  caption: "Compare three face-size pairs, unfold sample cuboid nets, and check shared edge lengths."
}
```

- [ ] **Step 3: Update README feature list**

Add:

```md
- Page 4: 长方体展开学习，比较 `长 x 宽`、`长 x 高`、`宽 x 高` 三对面，并检查相邻边长度是否匹配。
```

---

### Task 8: Verification

**Files:**
- No file changes

- [ ] **Step 1: Build the app**

Run:

```bash
cd light-learning-apps/apps/cube-surface-lab
npm run build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 2: Build all apps**

Run:

```bash
cd light-learning-apps
npm run build:all
```

Expected: the full apps collection builds.

- [ ] **Step 3: Manual browser checks**

Run:

```bash
cd light-learning-apps/apps/cube-surface-lab
npm run dev
```

Check:

- The cuboid tab opens without breaking cube pages.
- Pair mode clearly shows three equal face pairs.
- Net mode shows rectangles with visible proportions.
- Build Check mode lists only matching edges for the curated sample nets.
- Fold preview renders at desktop and mobile widths.
- Buttons and face labels do not overlap on a 390px-wide mobile viewport.

## Acceptance Criteria

- A cuboid learning page exists in `cube-surface-lab`.
- The page teaches three face-size pairs before showing nets.
- At least three curated cuboid nets are selectable.
- Rectangles render with meaningful proportions, not as six equal squares.
- The page can check adjacent edge-length compatibility for the shown net.
- The existing cube pages remain functional.
- `npm run build` passes for `cube-surface-lab`.

## Self-Review

- Spec coverage: the plan covers long cuboid unfolding as a separate learning design and keeps it connected to cube unfolding.
- Placeholder scan: all model types, constants, helpers, components, and CSS hooks are named with concrete code.
- Type consistency: `CuboidFaceId`, `CuboidFaceKind`, `CuboidNet`, `CuboidNetCell`, and `CuboidMode` are defined before use.
