import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, ArrowRight } from "lucide-react";
import { PixelDogSprite } from "./components/PixelDogSprite";

// ── Constants ─────────────────────────────────────────────────────────────────
const SPEED_M_PER_MIN = 10000 / 60; // 10 km/h in m/min ≈ 166.67
const SPEED_PX_PER_MIN = 100;       // SVG px per problem-minute (600px = 1000m at t=6)
const MAX_T = 6;                    // problem minutes
const ANIM_SCALE = 0.5;             // problem-min per anim-second at 1×

// ── Path helpers ──────────────────────────────────────────────────────────────
function fold(dist: number, leg: number) {
  const phase = dist % (leg * 2);
  return phase <= leg ? phase : leg * 2 - phase;
}

const STREET_PTS: [number, number][] = [
  [22, 34], [196, 34],
  [196, 82], [40, 82],
  [40, 130], [196, 130],
];

function followWaypoints(dist: number, pts: [number, number][]) {
  const segs = pts.slice(1).map(([x1, y1], i) => {
    const [x0, y0] = pts[i];
    return { x0, y0, x1, y1, len: Math.hypot(x1 - x0, y1 - y0) };
  });
  const total = segs.reduce((s, g) => s + g.len, 0);
  let rem = dist % total;
  for (const g of segs) {
    if (rem <= g.len) {
      const t = rem / g.len;
      return {
        x: g.x0 + t * (g.x1 - g.x0),
        y: g.y0 + t * (g.y1 - g.y0),
        angle: Math.atan2(g.y1 - g.y0, g.x1 - g.x0),
      };
    }
    rem -= g.len;
  }
  return { x: pts[0][0], y: pts[0][1], angle: 0 };
}

// ── Scenario positions ────────────────────────────────────────────────────────
const VW = 224, VH = 152, CX = 112, CY = 76;
const LINEAR_X0 = 20;
const LINEAR_MIN_LEN = 184;
const LINEAR_END_PAD = 20;
// 1m = SPEED_PX_PER_MIN / SPEED_M_PER_MIN px = 0.6 px; 100m = 60px
const M_TO_PX = SPEED_PX_PER_MIN / SPEED_M_PER_MIN; // ≈ 0.6
const MILESTONE_INTERVAL_M = 100; // every 100 m
const MILESTONE_PX = MILESTONE_INTERVAL_M * M_TO_PX; // 60 px

function getPos(type: string, dist: number) {
  switch (type) {
    case "shuttle": {
      const L = 68, x0 = CX - L / 2;
      return { x: x0 + fold(dist, L), y: CY, angle: (dist % (L * 2)) <= L ? 0 : Math.PI };
    }
    case "oval": {
      const rx = 76, ry = 42;
      const C = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
      const alpha = (dist / C) * 2 * Math.PI;
      return {
        x: CX + rx * Math.sin(alpha),
        y: CY - ry * Math.cos(alpha),
        angle: Math.atan2(ry * Math.sin(alpha), rx * Math.cos(alpha)),
      };
    }
    case "street":
      return followWaypoints(dist, STREET_PTS);
    default:
      return { x: CX, y: CY, angle: 0 };
  }
}

// ── Individual panel ──────────────────────────────────────────────────────────
function ScenarioPanel({ type, label, sublabel, dist, distM, playing }: {
  type: string; label: string; sublabel: string; dist: number; distM: number; playing: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { x: baseX, y: baseY, angle } = getPos(type, dist);
  const linearEnd = Math.max(LINEAR_X0 + LINEAR_MIN_LEN, LINEAR_X0 + dist + 36);
  const linearSvgW = Math.max(VW, linearEnd + LINEAR_END_PAD);
  const x = type === "linear" ? LINEAR_X0 + dist : baseX;
  const y = type === "linear" ? CY : baseY;
  const facingLeft = type === "linear" ? false : Math.cos(angle) < 0;

  useEffect(() => {
    if (type !== "linear" || !scrollRef.current) return;
    const viewport = scrollRef.current;
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const targetLeft = Math.max(0, Math.min(maxScroll, x - viewport.clientWidth * 0.45));
    viewport.scrollLeft = targetLeft;
  }, [type, x, linearSvgW]);

  // Path background
  let track: React.ReactNode = null;
  let deco: React.ReactNode = null;

  if (type === "linear") {
    // How many 100m milestones fit in the current track
    const milestoneCount = Math.floor((linearEnd - LINEAR_X0) / MILESTONE_PX);
    track = (
      <line
        x1={LINEAR_X0}
        y1={CY}
        x2={linearEnd}
        y2={CY}
        stroke="#E5E7EB"
        strokeWidth="8"
        strokeLinecap="round"
      />
    );
    deco = (
      <>
        <circle cx={LINEAR_X0} cy={CY} r="6" fill="#D1D5DB" />
        {/* 0m label */}
        <text x={LINEAR_X0} y={CY + 20} fontSize="9" fill="rgba(0,0,0,0.3)" textAnchor="middle">0</text>
        {Array.from({ length: milestoneCount }).map((_, i) => {
          const mX = LINEAR_X0 + (i + 1) * MILESTONE_PX;
          const mLabel = (i + 1) * MILESTONE_INTERVAL_M;
          return (
            <g key={mX}>
              <line x1={mX} y1={CY - 10} x2={mX} y2={CY + 10} stroke="#D1D5DB" strokeWidth="1.5" />
              <text x={mX} y={CY + 20} fontSize="9" fill="rgba(0,0,0,0.3)" textAnchor="middle">{mLabel}</text>
            </g>
          );
        })}
      </>
    );
  } else if (type === "shuttle") {
    const L = 68, x0 = CX - L / 2, x1 = CX + L / 2;
    track = <line x1={x0} y1={CY} x2={x1} y2={CY} stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round" />;
    deco = (
      <>
        <rect x={x0 - 5} y={CY - 18} width="10" height="36" rx="4" fill="#D1D5DB" />
        <rect x={x1 - 5} y={CY - 18} width="10" height="36" rx="4" fill="#D1D5DB" />
      </>
    );
  } else if (type === "oval") {
    deco = <ellipse cx={CX} cy={CY} rx={76} ry={42} fill="none" stroke="#E5E7EB" strokeWidth="16" />;
    track = <ellipse cx={CX} cy={CY} rx={76} ry={42} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="10" strokeDasharray="8 6" />;
  } else if (type === "street") {
    const d = STREET_PTS.map(([px, py], i) => `${i === 0 ? "M" : "L"} ${px} ${py}`).join(" ");
    deco = <path d={d} fill="none" stroke="#E5E7EB" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />;
    track = <path d={d} fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 8" />;
  }

  return (
    <div className="sc-panel">
      <div className="sc-panel__head">
        <span className="sc-panel__label">{label}</span>
        <span className="sc-panel__sub">{sublabel}</span>
      </div>
      <div ref={scrollRef} className={`sc-svg-shell ${type === "linear" ? "sc-svg-shell--scroll" : ""} ${type === "linear" && !playing ? "sc-svg-shell--show-scroll" : ""}`}>
        <svg
          viewBox={`0 0 ${type === "linear" ? linearSvgW : VW} ${VH}`}
          className="sc-svg"
          style={type === "linear" ? { width: `${linearSvgW}px`, minWidth: `${linearSvgW}px` } : undefined}
        >
          {deco}
          {track}
          <PixelDogSprite x={x} y={y} size={type === "linear" ? 30 : 18} facingLeft={facingLeft} />
        </svg>
      </div>
      <div className="sc-panel__dist">
        路程 <strong>{distM.toFixed(0)}</strong> m
      </div>
    </div>
  );
}

// ── Main IntroPage ────────────────────────────────────────────────────────────
export function IntroPage({ onEnter }: { onEnter: () => void }) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const dist = SPEED_PX_PER_MIN * time;
  const distM = SPEED_M_PER_MIN * time;

  useEffect(() => {
    if (!playing) { lastTsRef.current = null; return; }
    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      let stop = false;
      setTime(prev => {
        const next = prev + dt * ANIM_SCALE * speed;
        if (next >= MAX_T) { stop = true; return MAX_T; }
        return next;
      });
      if (stop) { setPlaying(false); lastTsRef.current = null; return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, speed]);

  function reset() {
    setPlaying(false); setTime(0); lastTsRef.current = null;
  }

  function handlePlay() {
    if (time >= MAX_T) setTime(0);
    setPlaying(true);
  }

  const SCENARIOS = [
    { type: "linear",  label: "跑直线",  sublabel: "一直向前" },
    { type: "shuttle", label: "往返跑",  sublabel: "短程多次折返" },
    { type: "oval",    label: "跑道绕圈", sublabel: "椭圆跑道" },
    { type: "street",  label: "马路街道", sublabel: "转弯绕路" },
  ];

  return (
    <main className="intro-lab">
      <div className="grid-bg" />

      <header className="intro-header">
        <p className="eyebrow">Light Math · 行程问题 前置理解</p>
        <h1>路程 = 速度 × 时间</h1>
        <p className="intro-subtitle">
          小狗以 <strong>10 km/h</strong> 奔跑，不管跑什么路线、方向怎么变
          <br />路程始终都是 <strong>速度 × 时间</strong>
        </p>
      </header>

      {/* ── Shared formula counter ───────────────────────────────────────── */}
      <div className="intro-counter card">
        <div className="intro-counter__block">
          <span className="intro-counter__label">时间</span>
          <span className="intro-counter__val">{time.toFixed(2)}</span>
          <span className="intro-counter__unit">分钟</span>
        </div>
        <div className="intro-counter__op">×</div>
        <div className="intro-counter__block">
          <span className="intro-counter__label">速度</span>
          <span className="intro-counter__val">10</span>
          <span className="intro-counter__unit">km/h</span>
        </div>
        <div className="intro-counter__op">÷ 60 =</div>
        <div className="intro-counter__block intro-counter__block--result">
          <span className="intro-counter__label">路程</span>
          <span className="intro-counter__val">{distM.toFixed(0)}</span>
          <span className="intro-counter__unit">m</span>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="controls" style={{ marginBottom: 16 }}>
        <button className="btn btn--play" onClick={handlePlay} disabled={playing}>
          <Play size={15} /> 播放
        </button>
        <button className="btn btn--pause" onClick={() => setPlaying(false)} disabled={!playing}>
          <Pause size={15} /> 暂停
        </button>
        <button className="btn btn--reset" onClick={reset}>
          <RotateCcw size={14} /> 重置
        </button>
        <div className="speed-group">
          {[0.5, 1, 2].map(s => (
            <button key={s} className={`speed-btn ${speed === s ? "active" : ""}`} onClick={() => setSpeed(s)}>
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* ── 4 scenario panels ────────────────────────────────────────────── */}
      <div className="scenarios-grid">
        {SCENARIOS.map(s => (
          <ScenarioPanel key={s.type} {...s} dist={dist} distM={distM} playing={playing} />
        ))}
      </div>

      {/* ── Enter main problem ───────────────────────────────────────────── */}
      <div className="intro-enter">
        <p className="intro-enter__hint">↑ 四种路线，路程计数完全相同</p>
        <button className="intro-enter__btn" onClick={onEnter}>
          开始题目 <ArrowRight size={17} />
        </button>
      </div>
    </main>
  );
}
