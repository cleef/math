export type Shot = {
  id: number;
  x: number;
  y: number;
  distanceToCenter: number;
};

export type ShooterProfile = {
  id: string;
  name: string;
  combo: string;
  teaser: string;
  reveal: string;
  bias: { x: number; y: number };
  spread: number;
  accent: string;
  glow: string;
};

export const TARGET_RADIUS = 180;
export const MAX_SHOTS = 10;
export const RING_LAYER_WIDTH = 45;

export const shooters: ShooterProfile[] = [
  {
    id: "centered-captain",
    name: "红心校准员",
    combo: "低偏差 + 低方差",
    teaser: "习惯先深呼吸，再慢慢扣扳机。",
    reveal: "瞄得准，也打得稳，弹着点会紧紧围住靶心。",
    bias: { x: 0, y: 0 },
    spread: 14,
    accent: "#ff6b6b",
    glow: "rgba(255, 107, 107, 0.28)"
  },
  {
    id: "stubborn-sniper",
    name: "固执偏靶手",
    combo: "高偏差 + 低方差",
    teaser: "他每次都照着自己的老习惯瞄准。",
    reveal: "每一枪都很稳定，但整团弹着点偏离靶心。",
    bias: { x: 52, y: -32 },
    spread: 14,
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.28)"
  },
  {
    id: "stormy-ranger",
    name: "追风散弹客",
    combo: "低偏差 + 高方差",
    teaser: "他总觉得风向随时都在变。",
    reveal: "平均上还算瞄着中心，但每一枪都飘得比较散。",
    bias: { x: 0, y: 0 },
    spread: 42,
    accent: "#4ade80",
    glow: "rgba(74, 222, 128, 0.28)"
  },
  {
    id: "lost-drifter",
    name: "迷航喷射王",
    combo: "高偏差 + 高方差",
    teaser: "一上场就很有气势，但节奏全靠感觉。",
    reveal: "既不准也不稳，整体偏离靶心而且分布很散。",
    bias: { x: -58, y: 40 },
    spread: 42,
    accent: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.28)"
  }
];

function gaussianRandom(random: () => number) {
  let u = 0;
  let v = 0;

  while (u === 0) {
    u = random();
  }

  while (v === 0) {
    v = random();
  }

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed: number) {
  let current = seed >>> 0;

  return function next() {
    current += 0x6d2b79f5;
    let t = current;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createShot(
  profile: ShooterProfile,
  id: number,
  existingShots: Shot[],
  random: () => number = Math.random
): Shot {
  const currentMeanX =
    existingShots.length > 0
      ? existingShots.reduce((sum, shot) => sum + shot.x, 0) / existingShots.length
      : 0;
  const currentMeanY =
    existingShots.length > 0
      ? existingShots.reduce((sum, shot) => sum + shot.y, 0) / existingShots.length
      : 0;
  const correctionStrength = profile.id === "stormy-ranger" ? 0.9 : 0;
  const x = clamp(
    profile.bias.x + gaussianRandom(random) * profile.spread - currentMeanX * correctionStrength,
    -TARGET_RADIUS - 8,
    TARGET_RADIUS + 8
  );
  const y = clamp(
    profile.bias.y + gaussianRandom(random) * profile.spread - currentMeanY * correctionStrength,
    -TARGET_RADIUS - 8,
    TARGET_RADIUS + 8
  );

  return {
    id,
    x,
    y,
    distanceToCenter: Math.hypot(x, y)
  };
}

export function simulateShots(profile: ShooterProfile, count: number, seed: number) {
  const random = mulberry32(seed);
  const shots: Shot[] = [];

  for (let index = 0; index < count; index += 1) {
    shots.push(createShot(profile, index + 1, shots, random));
  }

  return shots;
}

export function describeBias(distance: number) {
  if (distance < 24) {
    return "低偏差";
  }

  if (distance < 48) {
    return "中等偏差";
  }

  return "高偏差";
}

export function describeVariance(spread: number) {
  if (spread < 22) {
    return "低方差";
  }

  if (spread < 36) {
    return "中等方差";
  }

  return "高方差";
}

export function scoreShot(distance: number) {
  if (distance <= 18) {
    return 10;
  }

  if (distance <= 45) {
    return 8;
  }

  if (distance <= 90) {
    return 6;
  }

  if (distance <= 135) {
    return 4;
  }

  if (distance <= 180) {
    return 2;
  }

  return 0;
}

export function formatRingScore(distance: number) {
  const score = scoreShot(distance);
  return score > 0 ? `${score} 环` : "脱靶";
}

export function formatLayerDistance(distance: number) {
  return `${(distance / RING_LAYER_WIDTH).toFixed(1)} 圈`;
}

export function summarizeShots(shots: Shot[]) {
  const meanX =
    shots.length > 0 ? shots.reduce((sum, shot) => sum + shot.x, 0) / shots.length : 0;
  const meanY =
    shots.length > 0 ? shots.reduce((sum, shot) => sum + shot.y, 0) / shots.length : 0;
  const biasDistance = Math.hypot(meanX, meanY);
  const spread =
    shots.length > 0
      ? Math.sqrt(
          shots.reduce(
            (sum, shot) => sum + (shot.x - meanX) ** 2 + (shot.y - meanY) ** 2,
            0
          ) / shots.length
        )
      : 0;
  const averageScore =
    shots.length > 0
      ? shots.reduce((sum, shot) => sum + scoreShot(shot.distanceToCenter), 0) / shots.length
      : 0;

  return {
    meanX,
    meanY,
    biasDistance,
    spread,
    averageScore,
    lastShot: shots[shots.length - 1]
  };
}
