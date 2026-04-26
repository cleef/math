import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

type FaceId = "front" | "back" | "up" | "down" | "left" | "right";

type Point = {
  x: number;
  y: number;
};

type EdgeDef = {
  id: string;
  label: string;
  start: Point;
  end: Point;
  faces: [FaceId, FaceId];
};

type Evaluation = {
  success: boolean;
  connected: boolean;
  hasCycle: boolean;
  cutCount: number;
  uncutCount: number;
  message: string;
};

type Vector3 = {
  x: number;
  y: number;
  z: number;
};

type Orientation = {
  u: Vector3;
  v: Vector3;
  n: Vector3;
};

type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
};

type FoldDirection = "east" | "west" | "north" | "south";

type HingeSide = "top" | "right" | "bottom" | "left";

type NetDemoInput = {
  id: string;
  name: string;
  cells: Point[];
};

type NetDemo = {
  id: string;
  name: string;
  cells: Point[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; centerX: number; centerY: number };
  facePositions: Record<FaceId, Point>;
  hingeEdges: string[];
  cutEdges: string[];
};

type NetLayout = {
  facePositions: Record<FaceId, Point>;
  bounds: { minX: number; minY: number; maxX: number; maxY: number; centerX: number; centerY: number };
};

type CuboidFaceId = "front" | "back" | "top" | "bottom" | "left" | "right";

type CuboidFaceKind = "length-height" | "length-width" | "width-height";

type CuboidFace = {
  id: CuboidFaceId;
  label: string;
  kind: CuboidFaceKind;
  pairId: CuboidFaceId;
  size: {
    w: number;
    h: number;
  };
};

type CuboidNetCell = {
  faceId: CuboidFaceId;
  x: number;
  y: number;
  rotate?: boolean;
};

type CuboidNet = {
  id: string;
  name: string;
  cells: CuboidNetCell[];
  teachingNote: string;
};

type CuboidMode = "pairs" | "unfold" | "build";

type CuboidPlacedRect = {
  cell: CuboidNetCell;
  face: CuboidFace;
  x: number;
  y: number;
  w: number;
  h: number;
};

type CuboidAdjacency = {
  a: CuboidPlacedRect;
  b: CuboidPlacedRect;
  sharedLength: number;
  lengthMatches: boolean;
};

const FACE_IDS: FaceId[] = ["front", "back", "up", "down", "left", "right"];

const FACE_LABELS: Record<FaceId, string> = {
  front: "F",
  back: "B",
  up: "U",
  down: "D",
  left: "L",
  right: "R"
};

const FACE_CLASS_NAME: Record<FaceId, string> = {
  front: "front",
  back: "back",
  up: "top",
  down: "bottom",
  left: "left",
  right: "right"
};

const POINTS = {
  ftl: { x: 190, y: 120 },
  ftr: { x: 300, y: 120 },
  fbr: { x: 300, y: 230 },
  fbl: { x: 190, y: 230 },
  btl: { x: 120, y: 65 },
  btr: { x: 230, y: 65 },
  bbr: { x: 230, y: 175 },
  bbl: { x: 120, y: 175 }
} as const;

const MODEL_HALF = 1.1;

const MODEL_VERTICES = {
  ftl: { x: -MODEL_HALF, y: MODEL_HALF, z: MODEL_HALF },
  ftr: { x: MODEL_HALF, y: MODEL_HALF, z: MODEL_HALF },
  fbr: { x: MODEL_HALF, y: -MODEL_HALF, z: MODEL_HALF },
  fbl: { x: -MODEL_HALF, y: -MODEL_HALF, z: MODEL_HALF },
  btl: { x: -MODEL_HALF, y: MODEL_HALF, z: -MODEL_HALF },
  btr: { x: MODEL_HALF, y: MODEL_HALF, z: -MODEL_HALF },
  bbr: { x: MODEL_HALF, y: -MODEL_HALF, z: -MODEL_HALF },
  bbl: { x: -MODEL_HALF, y: -MODEL_HALF, z: -MODEL_HALF }
} as const;

const FACE_VERTEX_IDS: Record<FaceId, Array<keyof typeof MODEL_VERTICES>> = {
  front: ["ftl", "ftr", "fbr", "fbl"],
  back: ["btr", "btl", "bbl", "bbr"],
  up: ["btl", "btr", "ftr", "ftl"],
  down: ["fbl", "fbr", "bbr", "bbl"],
  left: ["btl", "ftl", "fbl", "bbl"],
  right: ["ftr", "btr", "bbr", "fbr"]
};

const EDGE_VERTEX_IDS: Record<string, [keyof typeof MODEL_VERTICES, keyof typeof MODEL_VERTICES]> = {
  "f-u": ["ftl", "ftr"],
  "f-r": ["ftr", "fbr"],
  "f-d": ["fbr", "fbl"],
  "f-l": ["fbl", "ftl"],
  "b-u": ["btl", "btr"],
  "b-r": ["btr", "bbr"],
  "b-d": ["bbr", "bbl"],
  "b-l": ["bbl", "btl"],
  "u-r": ["btr", "ftr"],
  "r-d": ["bbr", "fbr"],
  "d-l": ["bbl", "fbl"],
  "l-u": ["btl", "ftl"]
};

const EDGE_DEFS: EdgeDef[] = [
  { id: "f-u", label: "Front-Top", start: POINTS.ftl, end: POINTS.ftr, faces: ["front", "up"] },
  { id: "f-r", label: "Front-Right", start: POINTS.ftr, end: POINTS.fbr, faces: ["front", "right"] },
  { id: "f-d", label: "Front-Bottom", start: POINTS.fbr, end: POINTS.fbl, faces: ["front", "down"] },
  { id: "f-l", label: "Front-Left", start: POINTS.fbl, end: POINTS.ftl, faces: ["front", "left"] },
  { id: "b-u", label: "Back-Top", start: POINTS.btl, end: POINTS.btr, faces: ["back", "up"] },
  { id: "b-r", label: "Back-Right", start: POINTS.btr, end: POINTS.bbr, faces: ["back", "right"] },
  { id: "b-d", label: "Back-Bottom", start: POINTS.bbr, end: POINTS.bbl, faces: ["back", "down"] },
  { id: "b-l", label: "Back-Left", start: POINTS.bbl, end: POINTS.btl, faces: ["back", "left"] },
  { id: "u-r", label: "Top-Right", start: POINTS.btr, end: POINTS.ftr, faces: ["up", "right"] },
  { id: "r-d", label: "Right-Bottom", start: POINTS.bbr, end: POINTS.fbr, faces: ["right", "down"] },
  { id: "d-l", label: "Bottom-Left", start: POINTS.bbl, end: POINTS.fbl, faces: ["down", "left"] },
  { id: "l-u", label: "Left-Top", start: POINTS.btl, end: POINTS.ftl, faces: ["left", "up"] }
];

const EDGE_MAP = Object.fromEntries(
  EDGE_DEFS.map((edge) => [edge.id, edge])
) as Record<string, EdgeDef>;

const FACE_EDGE_IDS = Object.fromEntries(
  FACE_IDS.map((faceId) => [
    faceId,
    EDGE_DEFS.filter((edge) => edge.faces.includes(faceId)).map((edge) => edge.id)
  ])
) as Record<FaceId, string[]>;

const EDGE_ID_BY_FACE_PAIR = Object.fromEntries(
  EDGE_DEFS.map((edge) => {
    const key = [...edge.faces].sort().join("|");
    return [key, edge.id];
  })
) as Record<string, string>;

const DEMO_THREE_CUTS = ["f-u", "f-r", "u-r"];

const DEMO_SUCCESS_CUTS = ["f-u", "f-r", "f-d", "f-l", "b-u", "b-r", "b-d"];

const FOLDED_LAYOUT: Record<FaceId, { x: number; y: number; r: number; z: number; s: number }> = {
  front: { x: 0, y: 0, r: 0, z: 20, s: 1 },
  up: { x: 0, y: -52, r: -6, z: 18, s: 0.94 },
  down: { x: 0, y: 52, r: 6, z: 16, s: 0.94 },
  left: { x: -52, y: 0, r: 8, z: 14, s: 0.94 },
  right: { x: 52, y: 0, r: -8, z: 14, s: 0.94 },
  back: { x: 0, y: -104, r: 0, z: 12, s: 0.86 }
};

const ROOT_ORIENTATION: Orientation = {
  u: { x: 1, y: 0, z: 0 },
  v: { x: 0, y: 1, z: 0 },
  n: { x: 0, y: 0, z: 1 }
};

const FACE_EDGE_SIDES: Record<FaceId, Record<string, HingeSide>> = {
  front: { "f-u": "top", "f-r": "right", "f-d": "bottom", "f-l": "left" },
  back: { "b-u": "top", "b-r": "right", "b-d": "bottom", "b-l": "left" },
  up: { "b-u": "top", "u-r": "right", "f-u": "bottom", "l-u": "left" },
  down: { "f-d": "top", "r-d": "right", "b-d": "bottom", "d-l": "left" },
  left: { "l-u": "top", "f-l": "right", "d-l": "bottom", "b-l": "left" },
  right: { "u-r": "top", "b-r": "right", "r-d": "bottom", "f-r": "left" }
};

function sideVertexIndices(side: HingeSide): [number, number] {
  if (side === "top") {
    return [0, 1];
  }
  if (side === "right") {
    return [1, 2];
  }
  if (side === "bottom") {
    return [2, 3];
  }
  return [3, 0];
}

const FACE_EDGE_VERTEX_INDEX = Object.fromEntries(
  FACE_IDS.map((faceId) => [
    faceId,
    Object.fromEntries(
      FACE_EDGE_IDS[faceId].map((edgeId) => [edgeId, sideVertexIndices(FACE_EDGE_SIDES[faceId][edgeId])])
    )
  ])
) as Record<FaceId, Record<string, [number, number]>>;

const CUBE_NET_INPUTS: NetDemoInput[] = [
  {
    id: "net-01",
    name: "Net 01",
    cells: [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 2 }
    ]
  },
  {
    id: "net-02",
    name: "Net 02",
    cells: [
      { x: 0, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 2 }
    ]
  },
  {
    id: "net-03",
    name: "Net 03",
    cells: [
      { x: 0, y: 4 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 2 }
    ]
  },
  {
    id: "net-04",
    name: "Net 04",
    cells: [
      { x: 0, y: 5 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 2 }
    ]
  },
  {
    id: "net-05",
    name: "Net 05",
    cells: [
      { x: 0, y: 4 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 3 }
    ]
  },
  {
    id: "net-06",
    name: "Net 06",
    cells: [
      { x: 0, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 3 }
    ]
  },
  {
    id: "net-07",
    name: "Net 07",
    cells: [
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 2 },
      { x: 2, y: 3 }
    ]
  },
  {
    id: "net-08",
    name: "Net 08",
    cells: [
      { x: 0, y: 4 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 1, y: 5 },
      { x: 2, y: 2 },
      { x: 2, y: 3 }
    ]
  },
  {
    id: "net-09",
    name: "Net 09",
    cells: [
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 2 }
    ]
  },
  {
    id: "net-10",
    name: "Net 10",
    cells: [
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 2 },
      { x: 2, y: 3 }
    ]
  },
  {
    id: "net-11",
    name: "Net 11",
    cells: [
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ]
  }
];

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function boundsFromFacePositions(facePositions: Record<FaceId, Point>): NetLayout["bounds"] {
  const xs = FACE_IDS.map((faceId) => facePositions[faceId].x);
  const ys = FACE_IDS.map((faceId) => facePositions[faceId].y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}

function sideDelta(side: HingeSide): Point {
  if (side === "top") {
    return { x: 0, y: -1 };
  }
  if (side === "right") {
    return { x: 1, y: 0 };
  }
  if (side === "bottom") {
    return { x: 0, y: 1 };
  }
  return { x: -1, y: 0 };
}

function buildNetLayoutFromHinges(hingeEdges: string[]): NetLayout {
  const hingeSet = new Set(hingeEdges);
  const adjacency = new Map<FaceId, Array<{ faceId: FaceId; edgeId: string }>>(
    FACE_IDS.map((faceId) => [faceId, []])
  );

  for (const edge of EDGE_DEFS) {
    if (!hingeSet.has(edge.id)) {
      continue;
    }
    const [faceA, faceB] = edge.faces;
    adjacency.get(faceA)?.push({ faceId: faceB, edgeId: edge.id });
    adjacency.get(faceB)?.push({ faceId: faceA, edgeId: edge.id });
  }

  const positions = {
    front: { x: 0, y: 0 },
    back: { x: 0, y: 0 },
    up: { x: 0, y: 0 },
    down: { x: 0, y: 0 },
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  } satisfies Record<FaceId, Point>;
  const placed = new Set<FaceId>(["front"]);
  const queue: FaceId[] = ["front"];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }
    const currentPosition = positions[current];
    for (const next of adjacency.get(current) ?? []) {
      if (placed.has(next.faceId)) {
        continue;
      }
      const delta = sideDelta(FACE_EDGE_SIDES[current][next.edgeId]);
      positions[next.faceId] = {
        x: currentPosition.x + delta.x,
        y: currentPosition.y + delta.y
      };
      placed.add(next.faceId);
      queue.push(next.faceId);
    }
  }

  return {
    facePositions: positions,
    bounds: boundsFromFacePositions(positions)
  };
}

function layoutFromNetDemo(demo: Pick<NetDemo, "facePositions" | "bounds">): NetLayout {
  return {
    facePositions: demo.facePositions,
    bounds: demo.bounds
  };
}

function toggleOrdered(items: string[], value: string): string[] {
  if (items.includes(value)) {
    return items.filter((item) => item !== value);
  }
  return [...items, value];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function animateProgress(
  durationMs: number,
  onFrame: (progress: number) => void
): Promise<void> {
  await new Promise<void>((resolve) => {
    const startedAt = performance.now();
    const loop = (now: number) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      onFrame(progress);
      if (progress < 1) {
        window.requestAnimationFrame(loop);
      } else {
        resolve();
      }
    };
    window.requestAnimationFrame(loop);
  });
}

function evaluateCuts(cutEdges: string[]): Evaluation {
  const cutSet = new Set(cutEdges);
  const adjacency = new Map<FaceId, FaceId[]>(
    FACE_IDS.map((faceId) => [faceId, []])
  );

  for (const edge of EDGE_DEFS) {
    if (cutSet.has(edge.id)) {
      continue;
    }
    const [leftFace, rightFace] = edge.faces;
    adjacency.get(leftFace)?.push(rightFace);
    adjacency.get(rightFace)?.push(leftFace);
  }

  const visited = new Set<FaceId>();
  const stack: Array<{ node: FaceId; parent: FaceId | null }> = [
    { node: FACE_IDS[0], parent: null }
  ];
  let hasCycle = false;

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current.node)) {
      continue;
    }
    visited.add(current.node);
    const neighbors = adjacency.get(current.node) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push({ node: neighbor, parent: current.node });
      } else if (neighbor !== current.parent) {
        hasCycle = true;
      }
    }
  }

  const uncutCount = EDGE_DEFS.length - cutSet.size;
  const connected = visited.size === FACE_IDS.length;
  const success = connected && !hasCycle && uncutCount === FACE_IDS.length - 1;

  let message = "Keep cutting edges and run validation.";
  if (success) {
    message = "SUCCESS: This cut plan can fully unfold.";
  } else if (uncutCount > FACE_IDS.length - 1) {
    message = `Cut ${uncutCount - (FACE_IDS.length - 1)} more edge(s) to make full unfolding possible.`;
  } else if (!connected) {
    message = "Current cuts disconnect faces. A valid net must stay connected.";
  } else if (hasCycle || uncutCount < FACE_IDS.length - 1) {
    message = "Remaining hinges must be a 5-edge tree (connected and acyclic).";
  }

  return {
    success,
    connected,
    hasCycle,
    cutCount: cutSet.size,
    uncutCount,
    message
  };
}

function keyOf(point: Point): string {
  return `${point.x},${point.y}`;
}

function parseKey(key: string): Point {
  const [rawX, rawY] = key.split(",");
  return { x: Number(rawX), y: Number(rawY) };
}

function normalizeCells(cells: Point[]): Point[] {
  const minX = Math.min(...cells.map((cell) => cell.x));
  const minY = Math.min(...cells.map((cell) => cell.y));
  return cells.map((cell) => ({ x: cell.x - minX, y: cell.y - minY }));
}

function pickFrontReferenceCell(cells: Point[]): Point {
  const cellSet = new Set(cells.map((cell) => keyOf(cell)));
  const centroid = {
    x: cells.reduce((sum, cell) => sum + cell.x, 0) / cells.length,
    y: cells.reduce((sum, cell) => sum + cell.y, 0) / cells.length
  };

  const neighborCount = (cell: Point): number => {
    const offsets = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    return offsets.reduce((count, offset) => {
      const neighborKey = keyOf({ x: cell.x + offset.dx, y: cell.y + offset.dy });
      return count + (cellSet.has(neighborKey) ? 1 : 0);
    }, 0);
  };

  const sorted = [...cells].sort((left, right) => {
    const degreeDelta = neighborCount(right) - neighborCount(left);
    if (degreeDelta !== 0) {
      return degreeDelta;
    }

    const leftDist = Math.hypot(left.x - centroid.x, left.y - centroid.y);
    const rightDist = Math.hypot(right.x - centroid.x, right.y - centroid.y);
    if (leftDist !== rightDist) {
      return leftDist - rightDist;
    }

    if (left.y !== right.y) {
      return left.y - right.y;
    }
    return left.x - right.x;
  });

  return sorted[0];
}

function dot(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

function scale(v: Vector3, ratio: number): Vector3 {
  return {
    x: v.x * ratio,
    y: v.y * ratio,
    z: v.z * ratio
  };
}

function add(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z
  };
}

function rotateBy90(v: Vector3, axis: Vector3, direction: 1 | -1): Vector3 {
  const parallel = scale(axis, dot(axis, v));
  const perpendicular = scale(cross(axis, v), direction);
  const rotated = add(parallel, perpendicular);
  return {
    x: Math.round(rotated.x),
    y: Math.round(rotated.y),
    z: Math.round(rotated.z)
  };
}

function normalToFaceId(n: Vector3): FaceId {
  const code = `${n.x},${n.y},${n.z}`;
  if (code === "0,0,1") {
    return "front";
  }
  if (code === "0,0,-1") {
    return "back";
  }
  if (code === "0,1,0") {
    return "up";
  }
  if (code === "0,-1,0") {
    return "down";
  }
  if (code === "-1,0,0") {
    return "left";
  }
  return "right";
}

function directionFromDelta(dx: number, dy: number): FoldDirection | null {
  if (dx === 1 && dy === 0) {
    return "east";
  }
  if (dx === -1 && dy === 0) {
    return "west";
  }
  if (dx === 0 && dy === -1) {
    return "north";
  }
  if (dx === 0 && dy === 1) {
    return "south";
  }
  return null;
}

function foldToNeighbor(orientation: Orientation, direction: FoldDirection): Orientation {
  if (direction === "east") {
    return {
      u: rotateBy90(orientation.u, orientation.v, 1),
      v: rotateBy90(orientation.v, orientation.v, 1),
      n: rotateBy90(orientation.n, orientation.v, 1)
    };
  }
  if (direction === "west") {
    return {
      u: rotateBy90(orientation.u, orientation.v, -1),
      v: rotateBy90(orientation.v, orientation.v, -1),
      n: rotateBy90(orientation.n, orientation.v, -1)
    };
  }
  if (direction === "north") {
    return {
      u: rotateBy90(orientation.u, orientation.u, -1),
      v: rotateBy90(orientation.v, orientation.u, -1),
      n: rotateBy90(orientation.n, orientation.u, -1)
    };
  }
  return {
    u: rotateBy90(orientation.u, orientation.u, 1),
    v: rotateBy90(orientation.v, orientation.u, 1),
    n: rotateBy90(orientation.n, orientation.u, 1)
  };
}

function buildCubeNetDemo(input: NetDemoInput): NetDemo {
  const cells = normalizeCells(input.cells);
  const cellSet = new Set(cells.map((cell) => keyOf(cell)));
  const root = pickFrontReferenceCell(cells);
  const rootKey = keyOf(root);
  const orientationByKey = new Map<string, Orientation>([[rootKey, ROOT_ORIENTATION]]);
  const queue = [root];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const currentKey = keyOf(current);
    const currentOrientation = orientationByKey.get(currentKey);
    if (!currentOrientation) {
      continue;
    }

    const offsets = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    for (const offset of offsets) {
      const neighbor = { x: current.x + offset.dx, y: current.y + offset.dy };
      const neighborKey = keyOf(neighbor);
      if (!cellSet.has(neighborKey)) {
        continue;
      }

      const direction = directionFromDelta(offset.dx, offset.dy);
      if (!direction) {
        continue;
      }

      const nextOrientation = foldToNeighbor(currentOrientation, direction);
      const existed = orientationByKey.get(neighborKey);
      if (!existed) {
        orientationByKey.set(neighborKey, nextOrientation);
        queue.push(neighbor);
      }
    }
  }

  if (orientationByKey.size !== 6) {
    throw new Error(`Invalid net ${input.id}: orientation mapping failed.`);
  }

  const facePositions = {
    front: { x: 0, y: 0 },
    back: { x: 0, y: 0 },
    up: { x: 0, y: 0 },
    down: { x: 0, y: 0 },
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  } satisfies Record<FaceId, Point>;

  for (const [cellKey, orientation] of orientationByKey.entries()) {
    const faceId = normalToFaceId(orientation.n);
    facePositions[faceId] = parseKey(cellKey);
  }

  const hinges: string[] = [];
  const seenPairs = new Set<string>();

  for (const cell of cells) {
    const neighbors = [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 }
    ];

    for (const neighbor of neighbors) {
      const neighborKey = keyOf(neighbor);
      if (!cellSet.has(neighborKey)) {
        continue;
      }

      const leftFace = normalToFaceId(orientationByKey.get(keyOf(cell))!.n);
      const rightFace = normalToFaceId(orientationByKey.get(neighborKey)!.n);
      const pairCode = [leftFace, rightFace].sort().join("|");
      if (seenPairs.has(pairCode)) {
        continue;
      }
      seenPairs.add(pairCode);

      const edgeId = EDGE_ID_BY_FACE_PAIR[pairCode];
      if (!edgeId) {
        throw new Error(`Invalid net ${input.id}: cannot map face pair ${pairCode}`);
      }
      hinges.push(edgeId);
    }
  }

  const hingeSet = new Set(hinges);
  const cutEdges = EDGE_DEFS.map((edge) => edge.id).filter((edgeId) => !hingeSet.has(edgeId));

  const xs = cells.map((cell) => cell.x);
  const ys = cells.map((cell) => cell.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    id: input.id,
    name: input.name,
    cells,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    },
    facePositions,
    hingeEdges: EDGE_DEFS.map((edge) => edge.id).filter((edgeId) => hingeSet.has(edgeId)),
    cutEdges
  };
}

const CUBE_NET_DEMOS: NetDemo[] = CUBE_NET_INPUTS.map((item) => buildCubeNetDemo(item));
const PAGE_ONE_DEFAULT_LAYOUT = buildNetLayoutFromHinges(
  EDGE_DEFS.map((edge) => edge.id).filter((edgeId) => !DEMO_SUCCESS_CUTS.includes(edgeId))
);

type AxisMode = "find" | "reveal" | "fold";

type MainAxisNet = {
  netId: string;
  axisCells: Point[];
  capCells: Point[];
  note: string;
};

const MAIN_AXIS_NETS: MainAxisNet[] = [
  {
    netId: "net-01",
    axisCells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ],
    capCells: [
      { x: 0, y: 0 },
      { x: 2, y: 0 }
    ],
    note: "Two caps attach to the same end of the four-face belt."
  },
  {
    netId: "net-02",
    axisCells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ],
    capCells: [
      { x: 0, y: 1 },
      { x: 2, y: 0 }
    ],
    note: "The caps shift apart while the four-face belt stays straight."
  },
  {
    netId: "net-03",
    axisCells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ],
    capCells: [
      { x: 0, y: 2 },
      { x: 2, y: 0 }
    ],
    note: "The cap pair is farther apart, but the belt is still the same four-face chain."
  },
  {
    netId: "net-04",
    axisCells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ],
    capCells: [
      { x: 0, y: 3 },
      { x: 2, y: 0 }
    ],
    note: "The caps sit at opposite ends of the belt."
  },
  {
    netId: "net-05",
    axisCells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ],
    capCells: [
      { x: 0, y: 2 },
      { x: 2, y: 1 }
    ],
    note: "Both caps move inward while the belt remains unchanged."
  },
  {
    netId: "net-06",
    axisCells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ],
    capCells: [
      { x: 0, y: 1 },
      { x: 2, y: 1 }
    ],
    note: "Balanced caps make the 1 + 4 + 1 structure easiest to see."
  }
];

const CUBOID_FACES: CuboidFace[] = [
  {
    id: "front",
    label: "Front",
    kind: "length-height",
    pairId: "back",
    size: { w: 4, h: 3 }
  },
  {
    id: "back",
    label: "Back",
    kind: "length-height",
    pairId: "front",
    size: { w: 4, h: 3 }
  },
  {
    id: "top",
    label: "Top",
    kind: "length-width",
    pairId: "bottom",
    size: { w: 4, h: 2 }
  },
  {
    id: "bottom",
    label: "Bottom",
    kind: "length-width",
    pairId: "top",
    size: { w: 4, h: 2 }
  },
  {
    id: "left",
    label: "Left",
    kind: "width-height",
    pairId: "right",
    size: { w: 2, h: 3 }
  },
  {
    id: "right",
    label: "Right",
    kind: "width-height",
    pairId: "left",
    size: { w: 2, h: 3 }
  }
];

const CUBOID_NETS: CuboidNet[] = [
  {
    id: "cuboid-cross",
    name: "Cross net",
    teachingNote: "Four side faces form a belt. Top and bottom close the remaining two openings.",
    cells: [
      { faceId: "left", x: 0, y: 2 },
      { faceId: "front", x: 2, y: 2 },
      { faceId: "right", x: 6, y: 2 },
      { faceId: "back", x: 8, y: 2 },
      { faceId: "top", x: 2, y: 0 },
      { faceId: "bottom", x: 2, y: 5 }
    ]
  },
  {
    id: "cuboid-offset-caps",
    name: "Offset caps",
    teachingNote: "A cap can slide to another matching edge. The length of the shared edge still decides whether it works.",
    cells: [
      { faceId: "left", x: 0, y: 2 },
      { faceId: "front", x: 2, y: 2 },
      { faceId: "right", x: 6, y: 2 },
      { faceId: "back", x: 8, y: 2 },
      { faceId: "top", x: 2, y: 0 },
      { faceId: "bottom", x: 8, y: 5 }
    ]
  },
  {
    id: "cuboid-turned-cap",
    name: "Turned cap",
    teachingNote: "The bottom face is rotated, so its short edge can attach to a width-height side face.",
    cells: [
      { faceId: "left", x: 0, y: 2 },
      { faceId: "front", x: 2, y: 2 },
      { faceId: "right", x: 6, y: 2 },
      { faceId: "back", x: 8, y: 2 },
      { faceId: "top", x: 2, y: 0 },
      { faceId: "bottom", x: 0, y: 5, rotate: true }
    ]
  }
];

function getMainAxisForNet(netId: string): MainAxisNet | null {
  return MAIN_AXIS_NETS.find((item) => item.netId === netId) ?? null;
}

function pointListHas(points: Point[], cell: Point): boolean {
  const cellKey = keyOf(cell);
  return points.some((point) => keyOf(point) === cellKey);
}

function getFaceAtCell(demo: NetDemo, cell: Point): FaceId | null {
  const cellKey = keyOf(cell);
  return FACE_IDS.find((faceId) => keyOf(demo.facePositions[faceId]) === cellKey) ?? null;
}

function FlatNetStage({
  layout,
  progress,
  cellSize,
  className = ""
}: {
  layout: NetLayout;
  progress: number;
  cellSize: number;
  className?: string;
}) {
  const padding = 20;
  const faceSize = Math.max(50, cellSize - 4);
  const width = (layout.bounds.maxX - layout.bounds.minX + 1) * cellSize + padding * 2;
  const height = (layout.bounds.maxY - layout.bounds.minY + 1) * cellSize + padding * 2;
  const centerX = ((layout.bounds.centerX - layout.bounds.minX) + 0.5) * cellSize + padding;
  const centerY = ((layout.bounds.centerY - layout.bounds.minY) + 0.5) * cellSize + padding;

  return (
    <div
      className={`flat-net-stage ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-label="Cube net unfold animation"
    >
      {FACE_IDS.map((faceId) => {
        const cell = layout.facePositions[faceId];
        const finalX = (cell.x - layout.bounds.minX) * cellSize + padding + (cellSize - faceSize) / 2;
        const finalY = (cell.y - layout.bounds.minY) * cellSize + padding + (cellSize - faceSize) / 2;
        const folded = FOLDED_LAYOUT[faceId];
        const foldedX = centerX - faceSize / 2 + folded.x * 0.34;
        const foldedY = centerY - faceSize / 2 + folded.y * 0.34;
        const x = lerp(foldedX, finalX, progress);
        const y = lerp(foldedY, finalY, progress);
        const r = lerp(folded.r, 0, progress);
        const s = lerp(folded.s, 1, progress);

        return (
          <div
            key={faceId}
            className={`net-face net-face--flat net-face--${faceId}`}
            style={{
              width: `${faceSize}px`,
              height: `${faceSize}px`,
              transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
              zIndex: Math.round(lerp(folded.z, 18, progress))
            }}
            aria-label={`${faceId} face`}
          >
            {FACE_LABELS[faceId]}
          </div>
        );
      })}
    </div>
  );
}

function CubeCutExperimentPage() {
  const [plannedCuts, setPlannedCuts] = useState<string[]>([]);
  const [cutEdges, setCutEdges] = useState<string[]>([]);
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);
  const [activeProgress, setActiveProgress] = useState(0);
  const [isCutting, setIsCutting] = useState(false);
  const [statusText, setStatusText] = useState(
    "Pick edges first, then click Simulate Scissors."
  );
  const [unfoldProgress, setUnfoldProgress] = useState(0);
  const [isUnfolding, setIsUnfolding] = useState(false);
  const runTokenRef = useRef(0);

  const pendingCuts = useMemo(
    () => plannedCuts.filter((edgeId) => !cutEdges.includes(edgeId)),
    [plannedCuts, cutEdges]
  );
  const evaluation = useMemo(() => evaluateCuts(cutEdges), [cutEdges]);
  const netLayout = useMemo(() => {
    if (!evaluation.success) {
      return PAGE_ONE_DEFAULT_LAYOUT;
    }
    const cutSet = new Set(cutEdges);
    return buildNetLayoutFromHinges(
      EDGE_DEFS.map((edge) => edge.id).filter((edgeId) => !cutSet.has(edgeId))
    );
  }, [cutEdges, evaluation.success]);

  const activeScissorPoint = useMemo(() => {
    if (!activeEdgeId) {
      return null;
    }
    const edge = EDGE_MAP[activeEdgeId];
    if (!edge) {
      return null;
    }
    return {
      x: lerp(edge.start.x, edge.end.x, activeProgress),
      y: lerp(edge.start.y, edge.end.y, activeProgress)
    };
  }, [activeEdgeId, activeProgress]);

  const resetAll = () => {
    runTokenRef.current += 1;
    setPlannedCuts([]);
    setCutEdges([]);
    setActiveEdgeId(null);
    setActiveProgress(0);
    setIsCutting(false);
    setUnfoldProgress(0);
    setIsUnfolding(false);
    setStatusText("Reset complete. Select edges to cut again.");
  };

  const toggleEdgePlan = (edgeId: string) => {
    if (isCutting || isUnfolding || cutEdges.includes(edgeId)) {
      return;
    }
    setPlannedCuts((prev) => toggleOrdered(prev, edgeId));
  };

  const setDemoPlan = (preset: string[]) => {
    if (isCutting || isUnfolding) {
      return;
    }
    setPlannedCuts(preset.filter((edgeId) => !cutEdges.includes(edgeId)));
  };

  const runScissorSimulation = () => {
    if (isCutting || isUnfolding) {
      return;
    }
    if (pendingCuts.length === 0) {
      setStatusText("No new edge selected. Choose at least one uncut edge.");
      return;
    }

    const runToken = ++runTokenRef.current;
    setIsCutting(true);
    setUnfoldProgress(0);

    void (async () => {
      let nextCuts = [...cutEdges];
      try {
        for (let index = 0; index < pendingCuts.length; index += 1) {
          if (runToken !== runTokenRef.current) {
            return;
          }

          const edgeId = pendingCuts[index];
          setActiveEdgeId(edgeId);
          setStatusText(`Cut ${index + 1}: ${EDGE_MAP[edgeId].label}`);
          await animateProgress(760, (progress) => {
            if (runToken === runTokenRef.current) {
              setActiveProgress(progress);
            }
          });
          if (!nextCuts.includes(edgeId)) {
            nextCuts = [...nextCuts, edgeId];
            setCutEdges(nextCuts);
          }
          setActiveProgress(0);
          await sleep(130);
        }

        if (runToken !== runTokenRef.current) {
          return;
        }
        setPlannedCuts([]);
        setActiveEdgeId(null);
        const nextEvaluation = evaluateCuts(nextCuts);
        setStatusText(nextEvaluation.message);
        if (nextEvaluation.success) {
          setIsCutting(false);
          setIsUnfolding(true);
          setStatusText("Cuts complete. Opening the cube into a flat net...");
          await sleep(160);
          await animateProgress(1700, (progress) => {
            if (runToken === runTokenRef.current) {
              setUnfoldProgress(progress);
            }
          });
          if (runToken === runTokenRef.current) {
            setStatusText("SUCCESS: The cube has unfolded into a flat net.");
          }
        }
      } finally {
        if (runToken === runTokenRef.current) {
          setIsCutting(false);
          setIsUnfolding(false);
        }
      }
    })();
  };

  const animateUnfoldTo = (targetProgress: number) => {
    if (isCutting || isUnfolding || !evaluation.success) {
      return;
    }

    const runToken = ++runTokenRef.current;
    setIsUnfolding(true);
    const startProgress = unfoldProgress;
    setStatusText(targetProgress > startProgress ? "Opening the cube into a flat net..." : "Folding the net back toward the cube...");

    void (async () => {
      try {
        await animateProgress(1200, (progress) => {
          if (runToken === runTokenRef.current) {
            setUnfoldProgress(lerp(startProgress, targetProgress, progress));
          }
        });
        if (runToken === runTokenRef.current) {
          setStatusText(targetProgress === 1 ? "SUCCESS: The cube has unfolded into a flat net." : "Folded back. Unfold again when ready.");
        }
      } finally {
        if (runToken === runTokenRef.current) {
          setIsUnfolding(false);
        }
      }
    })();
  };

  return (
    <section className="workspace">
      <article className="panel panel--cube">
        <div className="panel__head">
          <h2>Step 1: Edge Selection + Scissor Simulation</h2>
          <div className="status-pill">
            {isCutting ? "Scissors Running" : isUnfolding ? "Unfolding" : "Ready"}
          </div>
        </div>

        <div className="cube-stage">
          <svg viewBox="70 35 290 225" role="img" aria-label="Clickable cube edge model">
            <polygon
              className="face face--back"
              points={`${POINTS.btl.x},${POINTS.btl.y} ${POINTS.btr.x},${POINTS.btr.y} ${POINTS.bbr.x},${POINTS.bbr.y} ${POINTS.bbl.x},${POINTS.bbl.y}`}
            />
            <polygon
              className="face face--top"
              points={`${POINTS.btl.x},${POINTS.btl.y} ${POINTS.btr.x},${POINTS.btr.y} ${POINTS.ftr.x},${POINTS.ftr.y} ${POINTS.ftl.x},${POINTS.ftl.y}`}
            />
            <polygon
              className="face face--left"
              points={`${POINTS.btl.x},${POINTS.btl.y} ${POINTS.bbl.x},${POINTS.bbl.y} ${POINTS.fbl.x},${POINTS.fbl.y} ${POINTS.ftl.x},${POINTS.ftl.y}`}
            />
            <polygon
              className="face face--right"
              points={`${POINTS.btr.x},${POINTS.btr.y} ${POINTS.bbr.x},${POINTS.bbr.y} ${POINTS.fbr.x},${POINTS.fbr.y} ${POINTS.ftr.x},${POINTS.ftr.y}`}
            />
            <polygon
              className="face face--bottom"
              points={`${POINTS.bbl.x},${POINTS.bbl.y} ${POINTS.bbr.x},${POINTS.bbr.y} ${POINTS.fbr.x},${POINTS.fbr.y} ${POINTS.fbl.x},${POINTS.fbl.y}`}
            />
            <polygon
              className="face face--front"
              points={`${POINTS.ftl.x},${POINTS.ftl.y} ${POINTS.ftr.x},${POINTS.ftr.y} ${POINTS.fbr.x},${POINTS.fbr.y} ${POINTS.fbl.x},${POINTS.fbl.y}`}
            />

            {EDGE_DEFS.map((edge) => {
              const isCut = cutEdges.includes(edge.id);
              const isPlanned = plannedCuts.includes(edge.id) && !isCut;
              const isActive = activeEdgeId === edge.id;
              return (
                <line
                  key={edge.id}
                  x1={edge.start.x}
                  y1={edge.start.y}
                  x2={edge.end.x}
                  y2={edge.end.y}
                  className={[
                    "edge",
                    isCut ? "edge--cut" : "",
                    isPlanned ? "edge--planned" : "",
                    isActive ? "edge--active" : ""
                  ].join(" ")}
                  onClick={() => toggleEdgePlan(edge.id)}
                />
              );
            })}

            {activeScissorPoint ? (
              <g transform={`translate(${activeScissorPoint.x}, ${activeScissorPoint.y})`}>
                <circle r="13" className="scissor-dot" />
                <text className="scissor-icon" textAnchor="middle" dominantBaseline="central">
                  ✂
                </text>
              </g>
            ) : null}
          </svg>
        </div>

        <div className="edge-toolbar">
          {EDGE_DEFS.map((edge) => {
            const isCut = cutEdges.includes(edge.id);
            const isPlanned = plannedCuts.includes(edge.id);
            return (
              <button
                key={edge.id}
                type="button"
                className={[
                  "edge-chip",
                  isCut ? "edge-chip--cut" : "",
                  isPlanned ? "edge-chip--planned" : ""
                ].join(" ")}
                disabled={isCut || isCutting || isUnfolding}
                onClick={() => toggleEdgePlan(edge.id)}
              >
                {edge.label}
              </button>
            );
          })}
        </div>

        <div className="button-row">
          <button type="button" onClick={runScissorSimulation} disabled={isCutting || isUnfolding}>
            Simulate Scissors
          </button>
          <button type="button" className="btn-muted" onClick={() => setDemoPlan(DEMO_THREE_CUTS)}>
            Demo: Pick 3 Edges
          </button>
          <button
            type="button"
            className="btn-muted"
            onClick={() => setDemoPlan(DEMO_SUCCESS_CUTS)}
          >
            Demo: 7-Cut Valid Net
          </button>
          <button type="button" className="btn-danger" onClick={resetAll}>
            Reset
          </button>
        </div>

        <div className="status-box">{statusText}</div>
      </article>

      <article className="panel panel--result">
        <div className="panel__head">
          <h2>Step 2: Net Validation</h2>
          <div className={`status-pill ${evaluation.success ? "status-pill--ok" : "status-pill--warn"}`}>
            {evaluation.success ? "SUCCESS" : "Not Ready"}
          </div>
        </div>

        <div className="metrics">
          <div>
            <span>Cut Edges</span>
            <strong>{evaluation.cutCount} / 12</strong>
          </div>
          <div>
            <span>Remaining Hinges</span>
            <strong>{evaluation.uncutCount} / 12</strong>
          </div>
          <div>
            <span>Connectivity</span>
            <strong>{evaluation.connected ? "Connected" : "Disconnected"}</strong>
          </div>
          <div>
            <span>Cycle Check</span>
            <strong>{evaluation.hasCycle ? "Cycle" : "Acyclic"}</strong>
          </div>
        </div>

        <p className="judge">{evaluation.message}</p>

        <div className="net-stage net-stage--preview">
          <FlatNetStage layout={netLayout} progress={unfoldProgress} cellSize={74} />
        </div>

        <div className="button-row">
          <button
            type="button"
            onClick={() => animateUnfoldTo(1)}
            disabled={!evaluation.success || isUnfolding || isCutting || unfoldProgress >= 1}
          >
            Unfold
          </button>
          <button
            type="button"
            className="btn-muted"
            onClick={() => animateUnfoldTo(0)}
            disabled={!evaluation.success || isUnfolding || isCutting || unfoldProgress <= 0}
          >
            Refold
          </button>
        </div>
      </article>
    </section>
  );
}

function NetThumbnail({ demo }: { demo: NetDemo }) {
  const cellSize = 17;
  return (
    <div className="net-thumb">
      {demo.cells.map((cell) => (
        <span
          key={`${demo.id}-${cell.x}-${cell.y}`}
          className="net-thumb__cell"
          style={{
            left: `${(cell.x - demo.bounds.minX) * cellSize}px`,
            top: `${(cell.y - demo.bounds.minY) * cellSize}px`
          }}
        />
      ))}
    </div>
  );
}

function getOpenableFaces(cutSet: Set<string>): FaceId[] {
  return FACE_IDS.filter((faceId) => FACE_EDGE_IDS[faceId].filter((edgeId) => cutSet.has(edgeId)).length >= 3);
}

function createDoorAngles(): Record<FaceId, number> {
  return {
    front: 0,
    back: 0,
    up: 0,
    down: 0,
    left: 0,
    right: 0
  };
}

function getFaceHingeSide(faceId: FaceId, cutSet: Set<string>): HingeSide {
  const faceEdges = FACE_EDGE_IDS[faceId];
  const uncutEdges = faceEdges.filter((edgeId) => !cutSet.has(edgeId));
  const hingeEdge = uncutEdges.length > 0 ? uncutEdges[0] : faceEdges[0];
  return FACE_EDGE_SIDES[faceId][hingeEdge];
}

function polygonToPoints(points: Array<{ x: number; y: number }>): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sub(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z
  };
}

function lengthVec(v: Vector3): number {
  return Math.hypot(v.x, v.y, v.z);
}

function normalizeVec(v: Vector3): Vector3 {
  const length = lengthVec(v);
  if (length < 1e-6) {
    return { x: 0, y: 0, z: 0 };
  }
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length
  };
}

function rotateAroundAxis(point: Vector3, axisStart: Vector3, axisEnd: Vector3, angleRad: number): Vector3 {
  const axis = normalizeVec(sub(axisEnd, axisStart));
  const relative = sub(point, axisStart);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const term1 = scale(relative, cos);
  const term2 = scale(cross(axis, relative), sin);
  const term3 = scale(axis, dot(axis, relative) * (1 - cos));
  return add(axisStart, add(term1, add(term2, term3)));
}

function rotateByView(point: Vector3, yawDeg: number, pitchDeg: number): Vector3 {
  const yawRad = (yawDeg * Math.PI) / 180;
  const pitchRad = (pitchDeg * Math.PI) / 180;
  const cosy = Math.cos(yawRad);
  const siny = Math.sin(yawRad);
  const cosx = Math.cos(pitchRad);
  const sinx = Math.sin(pitchRad);

  const yawRotated = {
    x: point.x * cosy + point.z * siny,
    y: point.y,
    z: -point.x * siny + point.z * cosy
  };

  return {
    x: yawRotated.x,
    y: yawRotated.y * cosx - yawRotated.z * sinx,
    z: yawRotated.y * sinx + yawRotated.z * cosx
  };
}

function projectPoint(point: Vector3, centerX: number, centerY: number): ProjectedPoint {
  const cameraDistance = 4.3;
  const focalLength = 320;
  const z = point.z + cameraDistance;
  return {
    x: centerX + (point.x * focalLength) / z,
    y: centerY - (point.y * focalLength) / z,
    z: point.z
  };
}

function getModelFacePoints(faceId: FaceId): Vector3[] {
  return FACE_VERTEX_IDS[faceId].map((vertexId) => MODEL_VERTICES[vertexId]);
}

function getDoorFacePoints(faceId: FaceId, side: HingeSide, angle: number): Vector3[] {
  const points = getModelFacePoints(faceId);
  if (angle <= 0) {
    return points;
  }

  const hingeIndices = sideVertexIndices(side);
  const h1 = points[hingeIndices[0]];
  const h2 = points[hingeIndices[1]];
  const rad = (angle * Math.PI) / 180;
  const centroid = {
    x: (points[0].x + points[1].x + points[2].x + points[3].x) / 4,
    y: (points[0].y + points[1].y + points[2].y + points[3].y) / 4,
    z: (points[0].z + points[1].z + points[2].z + points[3].z) / 4
  };
  const centroidPlus = rotateAroundAxis(centroid, h1, h2, rad);
  const centroidMinus = rotateAroundAxis(centroid, h1, h2, -rad);
  const sign = lengthVec(centroidPlus) >= lengthVec(centroidMinus) ? 1 : -1;

  return points.map((point) => rotateAroundAxis(point, h1, h2, sign * rad));
}

function CubeNetsDemoPage() {
  const [selectedId, setSelectedId] = useState(CUBE_NET_DEMOS[0].id);
  const [cutEdgesDone, setCutEdgesDone] = useState<string[]>([]);
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);
  const [activeCutProgress, setActiveCutProgress] = useState(0);
  const [isCuttingStep, setIsCuttingStep] = useState(false);
  const [netUnfoldProgress, setNetUnfoldProgress] = useState(0);
  const [isNetUnfolding, setIsNetUnfolding] = useState(false);
  const [doorAngles, setDoorAngles] = useState<Record<FaceId, number>>(() =>
    createDoorAngles()
  );
  const [statusText, setStatusText] = useState("Click one highlighted edge to make one cut.");
  const [viewYaw, setViewYaw] = useState(0);
  const [viewPitch, setViewPitch] = useState(-8);
  const [isDraggingView, setIsDraggingView] = useState(false);
  const runTokenRef = useRef(0);
  const dragRef = useRef<{
    pointerId: number | null;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>({
    pointerId: null,
    lastX: 0,
    lastY: 0,
    moved: false
  });
  const suppressClickRef = useRef(false);

  const selectedNet = useMemo(
    () => CUBE_NET_DEMOS.find((item) => item.id === selectedId) ?? CUBE_NET_DEMOS[0],
    [selectedId]
  );
  const selectedNetLayout = useMemo(() => layoutFromNetDemo(selectedNet), [selectedNet]);

  const selectedCutSet = useMemo(() => new Set(cutEdgesDone), [cutEdgesDone]);
  const openableFaces = useMemo(() => getOpenableFaces(selectedCutSet), [selectedCutSet]);
  const remainingTargetEdges = useMemo(
    () => selectedNet.cutEdges.filter((edgeId) => !selectedCutSet.has(edgeId)),
    [selectedCutSet, selectedNet]
  );
  const allTargetCutsDone = remainingTargetEdges.length === 0;
  const interactionBusy = isCuttingStep || isNetUnfolding;

  useEffect(() => {
    runTokenRef.current += 1;
    setCutEdgesDone([]);
    setActiveEdgeId(null);
    setActiveCutProgress(0);
    setIsCuttingStep(false);
    setNetUnfoldProgress(0);
    setIsNetUnfolding(false);
    setDoorAngles(createDoorAngles());
    setViewYaw(0);
    setViewPitch(-8);
    setIsDraggingView(false);
    setStatusText("Click one highlighted edge to make one cut.");
  }, [selectedId]);

  const resetCuts = () => {
    runTokenRef.current += 1;
    setCutEdgesDone([]);
    setActiveEdgeId(null);
    setActiveCutProgress(0);
    setIsCuttingStep(false);
    setNetUnfoldProgress(0);
    setIsNetUnfolding(false);
    setDoorAngles(createDoorAngles());
    setViewYaw(0);
    setViewPitch(-8);
    setIsDraggingView(false);
    setStatusText("Cuts reset. Start exploring again.");
  };

  const playNetUnfold = async (runToken: number, targetProgress: number, startProgress = netUnfoldProgress) => {
    setIsNetUnfolding(true);
    setStatusText(targetProgress > startProgress ? "Opening the cut cube into its net..." : "Folding the net back toward the cube...");
    await animateProgress(1250, (progress) => {
      if (runToken === runTokenRef.current) {
        setNetUnfoldProgress(lerp(startProgress, targetProgress, progress));
      }
    });
    if (runToken === runTokenRef.current) {
      setStatusText(targetProgress === 1 ? "The flat net is open. Refold or try another net." : "Folded back. Unfold again when ready.");
      setIsNetUnfolding(false);
    }
  };

  const runNetUnfoldTo = (targetProgress: number) => {
    if (interactionBusy || !allTargetCutsDone) {
      return;
    }

    const runToken = ++runTokenRef.current;
    void (async () => {
      try {
        await playNetUnfold(runToken, targetProgress);
      } finally {
        if (runToken === runTokenRef.current) {
          setIsNetUnfolding(false);
        }
      }
    })();
  };

  const runCutSequence = (edgeIds: string[], unfoldWhenComplete: boolean) => {
    if (interactionBusy) {
      return;
    }

    const targetEdges = edgeIds.filter(
      (edgeId) => selectedNet.cutEdges.includes(edgeId) && !selectedCutSet.has(edgeId)
    );
    if (targetEdges.length === 0) {
      if (allTargetCutsDone && unfoldWhenComplete) {
        runNetUnfoldTo(1);
      } else {
        setStatusText("Choose an uncut target edge.");
      }
      return;
    }

    const runToken = ++runTokenRef.current;
    setIsCuttingStep(true);
    setNetUnfoldProgress(0);

    void (async () => {
      let nextCuts = [...cutEdgesDone];
      try {
        for (let index = 0; index < targetEdges.length; index += 1) {
          if (runToken !== runTokenRef.current) {
            return;
          }
          const edgeId = targetEdges[index];
          setActiveEdgeId(edgeId);
          setStatusText(`Cutting ${EDGE_MAP[edgeId].label}...`);
          await animateProgress(540, (next) => {
            if (runToken === runTokenRef.current) {
              setActiveCutProgress(next);
            }
          });
          if (runToken !== runTokenRef.current) {
            return;
          }

          if (!nextCuts.includes(edgeId)) {
            nextCuts = [...nextCuts, edgeId];
            setCutEdgesDone(nextCuts);
          }
          setActiveEdgeId(null);
          setActiveCutProgress(0);
          await sleep(90);
        }

        if (runToken !== runTokenRef.current) {
          return;
        }

        const nextCutSet = new Set(nextCuts);
        const complete = selectedNet.cutEdges.every((edgeId) => nextCutSet.has(edgeId));
        if (complete && unfoldWhenComplete) {
          setIsCuttingStep(false);
          await sleep(120);
          await playNetUnfold(runToken, 1, 0);
        } else if (nextCuts.length < 3) {
          setStatusText("A slit is visible. Keep cutting. At 3 cuts you can open a face like a door.");
        } else {
          setStatusText("Great. Now adjust any openable face angle. Each face keeps its own angle.");
        }
      } finally {
        if (runToken === runTokenRef.current) {
          setIsCuttingStep(false);
          setActiveEdgeId(null);
          setActiveCutProgress(0);
          setIsNetUnfolding(false);
        }
      }
    })();
  };

  const cutSingleEdge = (edgeId: string) => {
    if (suppressClickRef.current) {
      return;
    }
    if (!selectedNet.cutEdges.includes(edgeId)) {
      setStatusText(`${EDGE_MAP[edgeId].label} is not part of this target net.`);
      return;
    }
    if (selectedCutSet.has(edgeId)) {
      setStatusText(`${EDGE_MAP[edgeId].label} is already cut.`);
      return;
    }
    runCutSequence([edgeId], true);
  };

  const handleViewPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    dragRef.current.pointerId = event.pointerId;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    dragRef.current.moved = false;
    setIsDraggingView(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleViewPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - dragRef.current.lastX;
    const dy = event.clientY - dragRef.current.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 1) {
      dragRef.current.moved = true;
      setViewYaw((prev) => prev + dx * 0.48);
      setViewPitch((prev) => clamp(prev - dy * 0.34, -80, 80));
    }
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
  };

  const finishViewDrag = () => {
    if (dragRef.current.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 120);
    }
    dragRef.current.pointerId = null;
    dragRef.current.moved = false;
    setIsDraggingView(false);
  };

  const handleViewPointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }
    finishViewDrag();
  };

  const handleViewPointerCancel: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }
    finishViewDrag();
  };

  const faceDoorMeta = FACE_IDS.reduce(
    (acc, faceId) => {
      const openable = openableFaces.includes(faceId);
      const hingeSide = getFaceHingeSide(faceId, selectedCutSet);
      const angle = openable ? doorAngles[faceId] ?? 0 : 0;
      const hingeEdge = FACE_EDGE_IDS[faceId].find(
        (edgeId) => FACE_EDGE_SIDES[faceId][edgeId] === hingeSide
      );
      acc[faceId] = {
        openable,
        hingeSide,
        hingeEdge: hingeEdge ?? FACE_EDGE_IDS[faceId][0],
        angle
      };
      return acc;
    },
    {} as Record<FaceId, { openable: boolean; hingeSide: HingeSide; hingeEdge: string; angle: number }>
  );

  const modelFacePoints = useMemo(
    () =>
      FACE_IDS.reduce(
        (acc, faceId) => {
          const doorMeta = faceDoorMeta[faceId];
          const isDoorFace = doorMeta.openable && doorMeta.angle > 0;
          acc[faceId] = isDoorFace
            ? getDoorFacePoints(faceId, doorMeta.hingeSide, doorMeta.angle)
            : getModelFacePoints(faceId);
          return acc;
        },
        {} as Record<FaceId, Vector3[]>
      ),
    [faceDoorMeta]
  );

  const projectedFaces = useMemo(() => {
    const projectionCenter = { x: 210, y: 162 };
    return FACE_IDS.map((faceId) => {
      const modelPoints = modelFacePoints[faceId];
      const viewPoints = modelPoints.map((point) => rotateByView(point, viewYaw, viewPitch));
      const projectedPoints = viewPoints.map((point) =>
        projectPoint(point, projectionCenter.x, projectionCenter.y)
      );
      const depth = viewPoints.reduce((sum, point) => sum + point.z, 0) / viewPoints.length;
      const isDoorFace = faceDoorMeta[faceId].openable && faceDoorMeta[faceId].angle > 0;
      return {
        faceId,
        projectedPoints,
        depth,
        isDoorFace
      };
    })
      .sort((left, right) => left.depth - right.depth);
  }, [faceDoorMeta, modelFacePoints, viewPitch, viewYaw]);

  const visibleFaceSet = useMemo(
    () => new Set<FaceId>(projectedFaces.map((item) => item.faceId)),
    [projectedFaces]
  );

  const projectedEdges = useMemo(() => {
    const projectionCenter = { x: 210, y: 162 };
    return EDGE_DEFS.map((edge) => {
      const [faceA, faceB] = edge.faces;
      const faceAOpensOnEdge =
        faceDoorMeta[faceA].openable &&
        faceDoorMeta[faceA].angle > 0 &&
        faceDoorMeta[faceA].hingeEdge !== edge.id;
      const faceBOpensOnEdge =
        faceDoorMeta[faceB].openable &&
        faceDoorMeta[faceB].angle > 0 &&
        faceDoorMeta[faceB].hingeEdge !== edge.id;

      let sourceFace: FaceId = faceA;
      if (faceAOpensOnEdge) {
        sourceFace = faceA;
      } else if (faceBOpensOnEdge) {
        sourceFace = faceB;
      } else if (!visibleFaceSet.has(faceA) && visibleFaceSet.has(faceB)) {
        sourceFace = faceB;
      }

      const sourceIndices = FACE_EDGE_VERTEX_INDEX[sourceFace][edge.id];
      const [fallbackA, fallbackB] = EDGE_VERTEX_IDS[edge.id];
      const startModel = sourceIndices
        ? modelFacePoints[sourceFace][sourceIndices[0]]
        : MODEL_VERTICES[fallbackA];
      const endModel = sourceIndices
        ? modelFacePoints[sourceFace][sourceIndices[1]]
        : MODEL_VERTICES[fallbackB];

      const startView = rotateByView(startModel, viewYaw, viewPitch);
      const endView = rotateByView(endModel, viewYaw, viewPitch);
      const start = projectPoint(startView, projectionCenter.x, projectionCenter.y);
      const end = projectPoint(endView, projectionCenter.x, projectionCenter.y);
      const depth = (startView.z + endView.z) / 2;

      return {
        id: edge.id,
        start,
        end,
        depth
      };
    })
      .sort((left, right) => left.depth - right.depth);
  }, [faceDoorMeta, modelFacePoints, viewPitch, viewYaw, visibleFaceSet]);

  const projectedEdgeMap = useMemo(
    () =>
      Object.fromEntries(projectedEdges.map((edge) => [edge.id, edge])) as Record<
        string,
        { id: string; start: ProjectedPoint; end: ProjectedPoint; depth: number }
      >,
    [projectedEdges]
  );

  const activeScissorPoint = useMemo(() => {
    if (!activeEdgeId) {
      return null;
    }
    const edge = projectedEdgeMap[activeEdgeId];
    if (!edge) {
      return null;
    }
    return {
      x: lerp(edge.start.x, edge.end.x, activeCutProgress),
      y: lerp(edge.start.y, edge.end.y, activeCutProgress)
    };
  }, [activeCutProgress, activeEdgeId, projectedEdgeMap]);

  const finalCellSize = 56;

  return (
    <section className="workspace workspace--nets">
      <article className="panel panel--nets-list">
        <div className="panel__head">
          <h2>11 Cube Nets</h2>
          <div className="status-pill">11 Total</div>
        </div>
        <div className="net-list">
          {CUBE_NET_DEMOS.map((demo) => (
            <button
              key={demo.id}
              type="button"
              className={`net-item ${selectedId === demo.id ? "net-item--active" : ""}`}
              onClick={() => setSelectedId(demo.id)}
            >
              <NetThumbnail demo={demo} />
              <div className="net-item__meta">
                <strong>{demo.name}</strong>
                <span>7 cuts / 5 hinges</span>
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="panel panel--nets-detail">
        <div className="panel__head">
          <h2>{selectedNet.name} Exploration</h2>
          <div className="status-pill status-pill--ok">Interactive</div>
        </div>

        <section className="demo-block">
          <h3>1) Target Edges To Cut (Click One Edge Per Cut)</h3>
          <div className="cut-list">
            {selectedNet.cutEdges.map((edgeId) => {
              const isDone = cutEdgesDone.includes(edgeId);
              const isActive = activeEdgeId === edgeId;
              return (
                <button
                  key={edgeId}
                  type="button"
                  className={[
                    "cut-tag",
                    isDone ? "cut-tag--done" : "",
                    isActive ? "cut-tag--active" : ""
                  ].join(" ")}
                  disabled={isDone || interactionBusy}
                  onClick={() => cutSingleEdge(edgeId)}
                >
                  {EDGE_MAP[edgeId].label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="demo-block">
          <h3>2) Cube Cutting + Door Interaction</h3>
          <div className="view-controls">
            <p>Drag the canvas to rotate the cube freely (360-degree feel).</p>
            <button
              type="button"
              className="btn-muted"
              disabled={interactionBusy}
              onClick={() => {
                setViewYaw(0);
                setViewPitch(-8);
              }}
            >
              Reset View
            </button>
          </div>
          <div
            className={`cube-stage cube-stage--sequence ${isDraggingView ? "cube-stage--dragging" : ""}`}
            onPointerDown={handleViewPointerDown}
            onPointerMove={handleViewPointerMove}
            onPointerUp={handleViewPointerUp}
            onPointerCancel={handleViewPointerCancel}
          >
            <div className="cube-orbit">
              <svg viewBox="0 0 420 330" role="img" aria-label="Cube edge cutting interaction">
                {projectedFaces.map((face) => (
                  <polygon
                    key={`face-${face.faceId}`}
                    className={`face face--${FACE_CLASS_NAME[face.faceId]} ${
                      face.isDoorFace ? "face--door" : ""
                    }`}
                    points={polygonToPoints(face.projectedPoints)}
                  />
                ))}
                {projectedEdges.map((edge) => {
                  const isTarget = selectedNet.cutEdges.includes(edge.id);
                  const isCut = cutEdgesDone.includes(edge.id);
                  const isActive = activeEdgeId === edge.id;
                  return (
                    <line
                      key={`${selectedNet.id}-${edge.id}`}
                      x1={edge.start.x}
                      y1={edge.start.y}
                      x2={edge.end.x}
                      y2={edge.end.y}
                      className={[
                        "edge",
                        !isTarget ? "edge--locked" : "",
                        isCut ? "edge--cut" : "",
                        isTarget && !isCut ? "edge--planned" : "",
                        isActive ? "edge--active" : ""
                      ].join(" ")}
                      onClick={() => cutSingleEdge(edge.id)}
                    />
                  );
                })}
                {activeScissorPoint ? (
                  <g transform={`translate(${activeScissorPoint.x}, ${activeScissorPoint.y})`}>
                    <circle r="13" className="scissor-dot" />
                    <text className="scissor-icon" textAnchor="middle" dominantBaseline="central">
                      ✂
                    </text>
                  </g>
                ) : null}
              </svg>
            </div>
          </div>
          <p className="judge">{statusText}</p>
          <div className="button-row">
            <button
              type="button"
              onClick={() => runCutSequence(remainingTargetEdges, true)}
              disabled={interactionBusy || remainingTargetEdges.length === 0}
            >
              Cut remaining + unfold
            </button>
            <button
              type="button"
              className="btn-muted"
              onClick={() => runNetUnfoldTo(1)}
              disabled={interactionBusy || !allTargetCutsDone || netUnfoldProgress >= 1}
            >
              Unfold
            </button>
            <button
              type="button"
              className="btn-muted"
              onClick={() => runNetUnfoldTo(0)}
              disabled={interactionBusy || !allTargetCutsDone || netUnfoldProgress <= 0}
            >
              Refold
            </button>
            <button type="button" className="btn-danger" onClick={resetCuts} disabled={interactionBusy}>
              Reset Cuts
            </button>
          </div>

          <div className="door-controls">
            <div className="door-controls__head">Door Angles (state is preserved per face)</div>
            <div className="door-angle-list">
              {FACE_IDS.map((faceId) => {
                const openable = faceDoorMeta[faceId].openable;
                return (
                  <label
                    key={`door-angle-${faceId}`}
                    className={`door-angle-row ${openable ? "" : "door-angle-row--disabled"}`}
                  >
                    <span>{faceId.toUpperCase()}</span>
                    <input
                      type="range"
                      min={0}
                      max={115}
                      step={1}
                      value={doorAngles[faceId] ?? 0}
                      onChange={(event) =>
                        setDoorAngles((prev) => ({
                          ...prev,
                          [faceId]: Number(event.target.value)
                        }))
                      }
                      disabled={!openable || interactionBusy}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <section className="demo-block">
          <h3>3) Final Net Shape</h3>
          <FlatNetStage
            layout={selectedNetLayout}
            progress={netUnfoldProgress}
            cellSize={finalCellSize}
            className="flat-net-stage--compact"
          />
        </section>
      </article>
    </section>
  );
}

function CubeMainAxisPage() {
  const [selectedId, setSelectedId] = useState("net-01");
  const [mode, setMode] = useState<AxisMode>("find");
  const [selectedCells, setSelectedCells] = useState<string[]>([]);

  const selectedNet = useMemo(
    () => CUBE_NET_DEMOS.find((item) => item.id === selectedId) ?? CUBE_NET_DEMOS[0],
    [selectedId]
  );
  const axisNet = getMainAxisForNet(selectedNet.id);
  const axisKeys = useMemo(
    () => new Set(axisNet?.axisCells.map((cell) => keyOf(cell)) ?? []),
    [axisNet]
  );
  const selectedKeySet = useMemo(() => new Set(selectedCells), [selectedCells]);
  const axisFound =
    Boolean(axisNet) &&
    selectedCells.length === axisKeys.size &&
    selectedCells.every((cellKey) => axisKeys.has(cellKey));
  const axisFaceIds = axisNet
    ? axisNet.axisCells
        .map((cell) => getFaceAtCell(selectedNet, cell))
        .filter((faceId): faceId is FaceId => Boolean(faceId))
    : [];
  const capFaceIds = axisNet
    ? axisNet.capCells
        .map((cell) => getFaceAtCell(selectedNet, cell))
        .filter((faceId): faceId is FaceId => Boolean(faceId))
    : [];
  const boardColumns = selectedNet.bounds.maxX - selectedNet.bounds.minX + 1;
  const boardRows = selectedNet.bounds.maxY - selectedNet.bounds.minY + 1;
  const statusText = !axisNet
    ? "This page starts with the first six straight-axis nets. Use Page 2 for this shape."
    : mode === "find"
      ? axisFound
        ? "Axis found: four connected faces make the cube belt."
        : `${selectedCells.length} / 4 axis cells selected`
      : mode === "reveal"
        ? "Blue faces make the main axis. Amber faces close the cube as caps."
        : axisNet.note;

  const resetSelection = () => {
    setMode("find");
    setSelectedCells([]);
  };

  const chooseNet = (netId: string) => {
    setSelectedId(netId);
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
      <article className="panel panel--axis-list">
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
                className={[
                  "axis-net-card",
                  selectedId === demo.id ? "axis-net-card--active" : "",
                  ready ? "" : "axis-net-card--muted"
                ].join(" ")}
                onClick={() => chooseNet(demo.id)}
              >
                <NetThumbnail demo={demo} />
                <span>{demo.name}</span>
                <small>{ready ? "straight axis" : "later pattern"}</small>
              </button>
            );
          })}
        </div>
      </article>

      <article className="panel panel--axis-board">
        <div className="panel__head">
          <h2>{selectedNet.name} Main Axis</h2>
          <div className={`status-pill ${axisFound ? "status-pill--ok" : axisNet ? "" : "status-pill--warn"}`}>
            {axisFound ? "Axis Found" : axisNet ? "Explore" : "Page 2"}
          </div>
        </div>

        <div
          className="axis-board"
          style={{
            gridTemplateColumns: `repeat(${boardColumns}, var(--axis-cell))`,
            gridTemplateRows: `repeat(${boardRows}, var(--axis-cell))`
          }}
        >
          {selectedNet.cells.map((cell) => {
            const faceId = getFaceAtCell(selectedNet, cell);
            const cellKey = keyOf(cell);
            const isSelected = selectedKeySet.has(cellKey);
            const isAxis = axisNet ? pointListHas(axisNet.axisCells, cell) : false;
            const isCap = axisNet ? pointListHas(axisNet.capCells, cell) : false;
            const showAnswer = mode !== "find";
            return (
              <button
                key={`${selectedNet.id}-${cellKey}`}
                type="button"
                className={[
                  "axis-cell",
                  isSelected ? "axis-cell--selected" : "",
                  showAnswer && isAxis ? "axis-cell--axis" : "",
                  showAnswer && isCap ? "axis-cell--cap" : ""
                ].join(" ")}
                style={{
                  gridColumn: cell.x - selectedNet.bounds.minX + 1,
                  gridRow: cell.y - selectedNet.bounds.minY + 1
                }}
                disabled={!axisNet || mode !== "find"}
                onClick={() => toggleCell(cell)}
              >
                <strong>{faceId ? FACE_LABELS[faceId] : ""}</strong>
                {showAnswer ? <span>{isAxis ? "axis" : "cap"}</span> : null}
              </button>
            );
          })}
        </div>

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

        <p className="judge">{statusText}</p>

        {mode === "fold" && axisNet ? (
          <div className="axis-fold" aria-label="Main axis fold preview">
            <div className="axis-cap axis-cap--top">
              {capFaceIds[0] ? FACE_LABELS[capFaceIds[0]] : "cap"}
            </div>
            <div className="axis-belt">
              {axisFaceIds.map((faceId, index) => (
                <span key={`${selectedNet.id}-belt-${faceId}`}>
                  <strong>{FACE_LABELS[faceId]}</strong>
                  <small>{index + 1}</small>
                </span>
              ))}
            </div>
            <div className="axis-cap axis-cap--bottom">
              {capFaceIds[1] ? FACE_LABELS[capFaceIds[1]] : "cap"}
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}

function CubeSurfaceLabApp() {
  const [page, setPage] = useState<"cut" | "nets" | "axis">("cut");
  const pageSubtitle = {
    cut: "Page 1: interactive edge-cut lab. Select edges, simulate scissors, then validate unfolding.",
    nets: "Page 2: all 11 cube nets. Each includes cut edges, step-by-step scissor unfolding, and final shape.",
    axis: "Page 3: find the four-face main axis, then watch the two caps close the cube."
  }[page];

  return (
    <main className="surface-lab">
      <header className="hero">
        <p className="hero__eyebrow">Surface Area Learning</p>
        <h1>Cube Surface Area Lab</h1>
        <p className="hero__subtitle">{pageSubtitle}</p>
        <div className="page-tabs">
          <button
            type="button"
            className={`tab-btn ${page === "cut" ? "tab-btn--active" : ""}`}
            onClick={() => setPage("cut")}
          >
            Page 1: Cut Lab
          </button>
          <button
            type="button"
            className={`tab-btn ${page === "nets" ? "tab-btn--active" : ""}`}
            onClick={() => setPage("nets")}
          >
            Page 2: 11 Net Demos
          </button>
          <button
            type="button"
            className={`tab-btn ${page === "axis" ? "tab-btn--active" : ""}`}
            onClick={() => setPage("axis")}
          >
            Page 3: Main Axis
          </button>
        </div>
      </header>

      {page === "cut" ? (
        <CubeCutExperimentPage />
      ) : page === "nets" ? (
        <CubeNetsDemoPage />
      ) : (
        <CubeMainAxisPage />
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CubeSurfaceLabApp />
  </React.StrictMode>
);
