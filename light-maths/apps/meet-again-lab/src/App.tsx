import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { IntroPage } from "./IntroPage";

// ── Math constants ───────────────────────────────────────────────────────────
const TRACK = 600;
const XQ_SPEED = 80;
const XM_SPEED = 70;
const TOTAL_T = 12;
const XQ_TURN_T = TRACK / XQ_SPEED; // 7.5
const XM_TURN_T = TRACK / XM_SPEED; // 60/7
const MEET_1_T = 4;
const MEET_1_POS = 320;
const MEET_2_T = 12;
const MEET_2_POS = 240;
const MIN_PER_ANIM_SEC = 0.5;
const XQ_POS_PHASE4 = TRACK - XQ_SPEED * (XM_TURN_T - XQ_TURN_T); // 3600/7 ≈ 514.3
const COMB_SPEED = XQ_SPEED + XM_SPEED; // 150

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function getPositions(t: number) {
  const xq = t <= XQ_TURN_T ? XQ_SPEED * t : TRACK - XQ_SPEED * (t - XQ_TURN_T);
  const xm = t <= XM_TURN_T ? TRACK - XM_SPEED * t : XM_SPEED * (t - XM_TURN_T);
  return { xq: clamp(xq, 0, TRACK), xm: clamp(xm, 0, TRACK) };
}

function getDir(t: number) {
  return { xqRight: t < XQ_TURN_T, xmRight: t >= XM_TURN_T };
}

const MILESTONES = [
  { t: MEET_1_T, label: "第一次相遇", detail: "t = 4 分钟，位置 320 m", kind: "meet" },
  { t: XQ_TURN_T, label: "小强折返", detail: "t = 7.5 分钟，到达右端 600 m", kind: "turn-xq" },
  { t: XM_TURN_T, label: "小明折返", detail: "t = 60/7 ≈ 8.57 分钟，到达左端 0 m", kind: "turn-xm" },
  { t: MEET_2_T, label: "第二次相遇", detail: "t = 12 分钟，位置 240 m ✓", kind: "meet" },
];


export default function App() {
  const [view, setView] = useState<"intro" | "main">("intro");
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [flash, setFlash] = useState<null | 1 | 2>(null);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const prevTimeRef = useRef(0);

  const { xq, xm } = getPositions(time);
  const { xqRight, xmRight } = getDir(time);
  const pct = (m: number) => `${(m / TRACK) * 100}%`;

  useEffect(() => {
    const prev = prevTimeRef.current;
    prevTimeRef.current = time;
    if (prev < MEET_1_T && time >= MEET_1_T) {
      setFlash(1);
      const id = setTimeout(() => setFlash(null), 2200);
      return () => clearTimeout(id);
    }
    if (prev < MEET_2_T && time >= MEET_2_T) {
      setFlash(2);
      const id = setTimeout(() => setFlash(null), 2800);
      return () => clearTimeout(id);
    }
  }, [time]);

  useEffect(() => {
    if (!playing) { lastTsRef.current = null; return; }
    const animate = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      let shouldStop = false;
      setTime((prev) => {
        const next = prev + dt * MIN_PER_ANIM_SEC * speed;
        if (next >= TOTAL_T) { shouldStop = true; return TOTAL_T; }
        return next;
      });
      if (shouldStop) { setPlaying(false); lastTsRef.current = null; return; }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [playing, speed]);

  function reset() {
    setPlaying(false); setTime(0); setFlash(null);
    lastTsRef.current = null; prevTimeRef.current = 0;
  }

  function handlePlay() {
    if (time >= TOTAL_T) { setTime(0); prevTimeRef.current = 0; }
    setPlaying(true);
  }

  if (view === "intro") return <IntroPage onEnter={() => setView("main")} />;

  return (
    <main className="lab">
      <div className="grid-bg" />

      <header className="lab-header">
        <p className="eyebrow">Light Math · 行程问题</p>
        <h1>折返相遇</h1>
        <p className="problem-stmt">
          600 米跑道 · <span className="xq-text">小强从左出发，80 m/分</span> ·{" "}
          <span className="xm-text">小明从右出发，70 m/分</span>
          <br />相向而行，到达对方出发点后原路折返，求<strong>第二次相遇</strong>的时间
        </p>
      </header>

      <section className="card track-card">
        <div className="track-info">
          <div className="time-readout">
            <span className="time-label">时间</span>
            <span className="time-val">{time.toFixed(2)}</span>
            <span className="time-unit">分钟</span>
          </div>
          <div className="pos-readouts">
            <div className="pos-chip pos-chip--xq">
              <span className="dot dot--xq" />
              小强&nbsp;<strong>{xq.toFixed(0)}&thinsp;m</strong>
              &nbsp;<span className="dir">{xqRight ? "→" : "←"}</span>
            </div>
            <div className="pos-chip pos-chip--xm">
              <span className="dot dot--xm" />
              小明&nbsp;<strong>{xm.toFixed(0)}&thinsp;m</strong>
              &nbsp;<span className="dir">{xmRight ? "→" : "←"}</span>
            </div>
          </div>
        </div>

        <div className="track-stage">
          <div className="ruler-labels">
            {[0, 150, 300, 450, 600].map((n) => (
              <span key={n} style={{ left: pct(n) }}>{n}</span>
            ))}
          </div>
          <div className="track-rail">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="tick" style={{ left: `${i * 25}%` }} />
            ))}
          </div>

          {time >= MEET_1_T && (
            <div className="meet-pin" style={{ left: pct(MEET_1_POS) }}>
              <div className="meet-pin__jewel" />
              <div className="meet-pin__tag">①&nbsp;{MEET_1_POS}m</div>
            </div>
          )}
          {time >= MEET_2_T && (
            <div className="meet-pin meet-pin--final" style={{ left: pct(MEET_2_POS) }}>
              <div className="meet-pin__jewel" />
              <div className="meet-pin__tag">②&nbsp;{MEET_2_POS}m</div>
            </div>
          )}

          {flash !== null && (
            <div
              className={`flash-burst flash-burst--${flash}`}
              style={{ left: pct(flash === 1 ? MEET_1_POS : MEET_2_POS) }}
            >
              <div className="flash-burst__ring" />
              <div className="flash-burst__ring flash-burst__ring--2" />
              <div className="flash-burst__badge">
                第{flash === 1 ? "一" : "二"}次相遇！
              </div>
            </div>
          )}

          <div
            className={`walker walker--xq ${xqRight ? "" : "walker--flip"}`}
            style={{ left: pct(xq) }}
          >
            <div className="walker__bubble">强</div>
            <div className="walker__trail" />
          </div>

          <div
            className={`walker walker--xm ${xmRight ? "walker--flip" : ""}`}
            style={{ left: pct(xm) }}
          >
            <div className="walker__bubble">明</div>
            <div className="walker__trail" />
          </div>
        </div>

        <div className="controls">
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
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                className={`speed-btn ${speed === s ? "active" : ""}`}
                onClick={() => setSpeed(s)}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        <div className="scrubber">
          <div className="scrubber__bar">
            <div className="scrubber__fill" style={{ width: `${(time / TOTAL_T) * 100}%` }} />
            {MILESTONES.map((m) => (
              <div
                key={m.t}
                className={`scrubber__event scrubber__event--${m.kind} ${time >= m.t ? "reached" : ""}`}
                style={{ left: `${(m.t / TOTAL_T) * 100}%` }}
                title={m.label}
              />
            ))}
          </div>
          <div className="scrubber__ticks">
            {[0, 4, 7.5, 8.6, 12].map((t) => (
              <span
                key={t}
                className={`scrubber__tick ${time >= t ? "reached" : ""}`}
                style={{ left: `${(t / TOTAL_T) * 100}%` }}
              >
                {t === 8.6 ? "60/7" : t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 路程模型 ─────────────────────────────────────────────────────── */}
      <DistanceModel time={time} />

      {/* ── 方法一：合计路程法 ────────────────────────────────────────────── */}
      <section className="card">
        <h2 className="card-title">方法一：合计路程法</h2>
        <div className="steps">
          <div className="step">第 <em>n</em> 次相遇，两人合计走 <strong>(2n−1)×600 m</strong></div>
          <div className="step">第 2 次相遇 → 合计 <strong>3×600 = 1800 m</strong></div>
          <div className="step">合速 = 80+70 = <strong>150 m/分</strong></div>
          <div className="step step--result">时间 = 1800 ÷ 150 = <strong>12 分钟</strong></div>
        </div>
      </section>

      {/* ── 方法二：分段追踪 ─────────────────────────────────────────────────── */}
      <SegmentedSolutionPanel />
    </main>
  );
}

// ── 分段解法面板 ──────────────────────────────────────────────────────────────
const PHASES = [
  { num: 1, startT: 0,         endT: MEET_1_T,  title: "相向而行，首次相遇",    color: "var(--meet)" },
  { num: 2, startT: MEET_1_T,  endT: XQ_TURN_T, title: "继续前行，小强到达右端", color: "var(--xq)"  },
  { num: 3, startT: XQ_TURN_T, endT: XM_TURN_T, title: "小强折返，小明到达左端", color: "var(--xm)"  },
  { num: 4, startT: XM_TURN_T, endT: MEET_2_T,  title: "双向折返，再次相遇",    color: "var(--meet)" },
];

function miniTrack(t: number, phaseNum: number) {
  const toX = (p: number) => 10 + (p / TRACK) * 280;
  const { xq, xm } = getPositions(t);
  const { xqRight, xmRight } = getDir(t);
  const xqX = toX(xq), xmX = toX(xm);
  const xq600X = toX(600); // = 290
  const showGap = phaseNum === 4 && xqX > xmX + 18;
  const returnDist = t > XQ_TURN_T ? 600 - xq : 0;
  const showReturn = returnDist > 2;
  return (
    <svg viewBox="0 0 300 56" className="phase-mini-track" aria-hidden="true">
      {/* Track rail */}
      <rect x="10" y="26" width="280" height="6" rx="3" fill="rgba(0,0,0,0.08)" />
      {/* Return distance segment (小强折返后走的路) */}
      {showReturn && (
        <rect x={xqX} y="26" width={xq600X - xqX} height="6" rx="1" fill="rgba(249,115,22,0.45)" />
      )}
      {/* End labels */}
      <text x="10" y="54" fontSize="9" fill="rgba(0,0,0,0.35)" textAnchor="middle">0</text>
      <text x="290" y="54" fontSize="9" fill="rgba(0,0,0,0.35)" textAnchor="middle">600</text>
      {/* Return distance label below track */}
      {showReturn && xq600X - xqX > 16 && (
        <text x={(xqX + xq600X) / 2} y="44" fontSize="8" fill="#EA580C" textAnchor="middle" fontWeight="700">
          {returnDist.toFixed(0)} m
        </text>
      )}
      {/* Gap bracket for phase 4 */}
      {showGap && (
        <g>
          <line x1={xmX + 6} y1="10" x2={xqX - 6} y2="10" stroke="#F59E0B" strokeWidth="1.5" />
          <polygon points={`${xmX},10 ${xmX + 7},7 ${xmX + 7},13`} fill="#F59E0B" />
          <polygon points={`${xqX},10 ${xqX - 7},7 ${xqX - 7},13`} fill="#F59E0B" />
          <text x={(xmX + xqX) / 2} y="8" fontSize="8" fill="#D97706" textAnchor="middle" fontWeight="700">
            {(xq - xm).toFixed(0)} m
          </text>
        </g>
      )}
      {/* XQ walker */}
      <circle cx={xqX} cy="29" r="7" fill="#F97316" stroke="white" strokeWidth="1.5" />
      <text x={xqX} y="29" fontSize="7" fill="white" textAnchor="middle" dominantBaseline="middle">强</text>
      <polygon fill="#F97316" points={xqRight
        ? `${xqX + 9},27 ${xqX + 9},31 ${xqX + 14},29`
        : `${xqX - 9},27 ${xqX - 9},31 ${xqX - 14},29`} />
      {/* XM walker */}
      <circle cx={xmX} cy="29" r="7" fill="#0EA5E9" stroke="white" strokeWidth="1.5" />
      <text x={xmX} y="29" fontSize="7" fill="white" textAnchor="middle" dominantBaseline="middle">明</text>
      <polygon fill="#0EA5E9" points={xmRight
        ? `${xmX + 9},27 ${xmX + 9},31 ${xmX + 14},29`
        : `${xmX - 9},27 ${xmX - 9},31 ${xmX - 14},29`} />
    </svg>
  );
}

function SegmentedSolutionPanel() {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef2 = useRef<number | null>(null);
  const lastTsRef2 = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) { lastTsRef2.current = null; return; }
    const animate = (ts: number) => {
      if (lastTsRef2.current === null) lastTsRef2.current = ts;
      const dt = (ts - lastTsRef2.current) / 1000;
      lastTsRef2.current = ts;
      let shouldStop = false;
      setTime((prev) => {
        const next = prev + dt * MIN_PER_ANIM_SEC;
        if (next >= TOTAL_T) { shouldStop = true; return TOTAL_T; }
        return next;
      });
      if (shouldStop) { setPlaying(false); lastTsRef2.current = null; return; }
      rafRef2.current = requestAnimationFrame(animate);
    };
    rafRef2.current = requestAnimationFrame(animate);
    return () => { if (rafRef2.current !== null) cancelAnimationFrame(rafRef2.current); };
  }, [playing]);

  function handlePlay() {
    if (time >= TOTAL_T) setTime(0);
    setPlaying(true);
  }
  function handleReset() {
    setPlaying(false); setTime(0);
    lastTsRef2.current = null;
  }

  return (
    <section className="card">
      <h2 className="card-title">方法二：分段追踪</h2>
      <div className="controls" style={{ marginBottom: 12 }}>
        <button className="btn btn--play" onClick={handlePlay} disabled={playing}
          style={{ padding: "5px 14px", fontSize: 13 }}>
          <Play size={13} /> 播放
        </button>
        <button className="btn btn--pause" onClick={() => setPlaying(false)} disabled={!playing}
          style={{ padding: "5px 14px", fontSize: 13 }}>
          <Pause size={13} /> 暂停
        </button>
        <button className="btn btn--reset" onClick={handleReset}
          style={{ padding: "5px 14px", fontSize: 13 }}>
          <RotateCcw size={12} /> 重置
        </button>
      </div>
      <div className="phase-list">
        {PHASES.map((p) => {
          const status = time >= p.endT ? "completed" : time >= p.startT ? "active" : "pending";
          const snapT = status === "completed" ? p.endT : p.startT;
          const live = status === "active";
          const trackT = live ? time : snapT;
          const { xq: lxq, xm: lxm } = getPositions(trackT);
          const liveGap = lxq - lxm;
          const liveLeft = liveGap > 0 ? liveGap / COMB_SPEED : 0;
          return (
            <div
              key={p.num}
              className={`phase-card phase-card--${status}`}
              style={status !== "pending" ? { borderLeftColor: p.color } : undefined}
            >
              <div className="phase-card__header">
                <span className="phase-badge" style={status !== "pending" ? { background: p.color } : undefined}>
                  {["①", "②", "③", "④"][p.num - 1]}
                </span>
                <span className="phase-card__title">{p.title}</span>
                {status === "active" && <span className="phase-status phase-status--active">进行中</span>}
                {status === "completed" && <span className="phase-status phase-status--done">✓</span>}
              </div>
              {miniTrack(trackT, p.num)}
              {p.num === 1 && status !== "pending" && (
                <div className="phase-fact">t = {MEET_1_T} 分钟 · 位置 <strong>{MEET_1_POS} m</strong></div>
              )}
              {p.num === 2 && status !== "pending" && (
                <div className="phase-fact">t = {XQ_TURN_T} 分钟 · 小强到达 <strong>600 m</strong>，折返向左</div>
              )}
              {p.num === 3 && status !== "pending" && (
                <div className="phase-fact">t = 60/7 ≈ {XM_TURN_T.toFixed(2)} 分钟 · 小明到达 <strong>0 m</strong>，折返向右</div>
              )}
              {p.num === 4 && status !== "pending" && (
                <div>
                  <div className="phase4-gap-box">
                    <span className="xq-text">小强 {XQ_POS_PHASE4.toFixed(1)} m ←</span>
                    <span className="phase4-gap-center">间距 3600/7 m</span>
                    <span className="xm-text">→ 0 m 小明</span>
                  </div>
                  <div className="phase4-gap-derive">
                    <div className="phase4-derive-steps">
                      <div>时间差 = 600/70 − 600/80 = <strong>15/14 分钟</strong>（小明比小强晚到）</div>
                      <div>小强已折返走了 15/14 × 80 = <strong>600/7 m</strong></div>
                      <div>小强位置 = 600 − 600/7 = <strong>3600/7 m</strong>（小明在 0 m，故间距 = 3600/7）</div>
                    </div>
                  </div>
                  {live && time < MEET_2_T && (
                    <div className="phase4-live-gap">
                      当前间距 <strong>{liveGap.toFixed(1)}</strong> m
                      &nbsp;·&nbsp; 合速 150 m/min
                      &nbsp;·&nbsp; 还需 <strong>{liveLeft.toFixed(2)}</strong> 分钟
                    </div>
                  )}
                  <div className="steps" style={{ marginTop: 8 }}>
                    <div className="step">3600/7 ÷ 150 = <strong>24/7 分钟</strong>（剩余时间）</div>
                    <div className="step">60/7 + 24/7 = 84/7 = <strong>12 分钟</strong></div>
                    {status === "completed" && (
                      <div className="step step--result">
                        小明从 0 m 走 70 × (24/7) = <strong>240 m</strong> ✓
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── 路程模型组件 ──────────────────────────────────────────────────────────────
const DM_W = 600, DM_H = 240;
const DM_L = 52, DM_T = 28, DM_R = 16, DM_B = 36;
const DM_PW = DM_W - DM_L - DM_R, DM_PH = DM_H - DM_T - DM_B;
// X: time 0→14  Y: distance 0→2100
const T_MAX = 14, D_MAX = 2100;
const dmx = (t: number) => DM_L + (t / T_MAX) * DM_PW;
const dmy = (d: number) => DM_T + (1 - d / D_MAX) * DM_PH;

// Threshold lines: nth meeting at combined = (2n-1)*600
const THRESHOLDS = [
  { d: 600, n: 1, t: 4, label: "第①次  600 m" },
  { d: 1800, n: 2, t: 12, label: "第②次  1800 m" },
];

function DistanceModel({ time }: { time: number }) {
  const xqDist = XQ_SPEED * time;      // 小强 accumulated (straight line)
  const xmDist = XM_SPEED * time;      // 小明 accumulated (straight line)
  const combined = xqDist + xmDist;    // = 150t

  return (
    <section className="card" style={{ marginTop: 16 }}>
      <h2 className="card-title">路程模型 — 展开折返，一切都是直线</h2>

      <div className="dm-layout">
        {/* ── insight list ─────────────────────────────────────────────── */}
        <div className="dm-insights">
          <div className="dm-insight">
            <div className="dm-insight__icon" style={{ background: "rgba(249,115,22,0.12)", color: "#F97316" }}>强</div>
            <div>
              <div className="dm-insight__title">小强累计路程</div>
              <div className="dm-insight__formula">d = <strong>80t</strong></div>
              <div className="dm-insight__val" style={{ color: "#F97316" }}>{xqDist.toFixed(0)} m</div>
            </div>
          </div>
          <div className="dm-insight">
            <div className="dm-insight__icon" style={{ background: "rgba(14,165,233,0.12)", color: "#0EA5E9" }}>明</div>
            <div>
              <div className="dm-insight__title">小明累计路程</div>
              <div className="dm-insight__formula">d = <strong>70t</strong></div>
              <div className="dm-insight__val" style={{ color: "#0EA5E9" }}>{xmDist.toFixed(0)} m</div>
            </div>
          </div>
          <div className="dm-insight dm-insight--combined">
            <div className="dm-insight__icon" style={{ background: "rgba(245,158,11,0.12)", color: "#D97706" }}>合</div>
            <div>
              <div className="dm-insight__title">合计路程</div>
              <div className="dm-insight__formula">d = <strong>150t</strong> = 80t + 70t</div>
              <div className="dm-insight__val" style={{ color: "#D97706" }}>{combined.toFixed(0)} m</div>
            </div>
          </div>
        </div>

        {/* ── SVG diagram ──────────────────────────────────────────────── */}
        <div className="dm-graph-wrap">
          <svg viewBox={`0 0 ${DM_W} ${DM_H}`} className="dm-svg" aria-label="路程模型图">
            {/* Grid */}
            {[0, 2, 4, 6, 8, 10, 12, 14].map(t => (
              <line key={`dg-t-${t}`} x1={dmx(t)} y1={DM_T} x2={dmx(t)} y2={DM_T + DM_PH}
                stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
            ))}
            {[0, 600, 1200, 1800].map(d => (
              <line key={`dg-d-${d}`} x1={DM_L} y1={dmy(d)} x2={DM_L + DM_PW} y2={dmy(d)}
                stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
            ))}

            {/* Axes */}
            <line x1={DM_L} y1={DM_T} x2={DM_L} y2={DM_T + DM_PH + 4}
              stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
            <line x1={DM_L - 4} y1={DM_T + DM_PH} x2={DM_L + DM_PW} y2={DM_T + DM_PH}
              stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />

            {/* Axis labels */}
            {[0, 4, 8, 12].map(t => (
              <text key={`dl-t-${t}`} x={dmx(t)} y={DM_T + DM_PH + 18}
                textAnchor="middle" fontSize="11" fill="rgba(0,0,0,0.38)">{t}</text>
            ))}
            {[0, 600, 1200, 1800].map(d => (
              <text key={`dl-d-${d}`} x={DM_L - 8} y={dmy(d) + 4}
                textAnchor="end" fontSize="11" fill="rgba(0,0,0,0.38)">{d}</text>
            ))}
            <text x={DM_L + DM_PW / 2} y={DM_T + DM_PH + 32} textAnchor="middle"
              fontSize="11" fill="rgba(0,0,0,0.35)">时间（分钟）</text>
            <text x={12} y={DM_T + DM_PH / 2} textAnchor="middle"
              fontSize="11" fill="rgba(0,0,0,0.35)"
              transform={`rotate(-90,12,${DM_T + DM_PH / 2})`}>累计路程（米）</text>

            {/* Meeting threshold lines */}
            {THRESHOLDS.map(th => (
              <g key={`th-${th.d}`}>
                <line x1={DM_L} y1={dmy(th.d)} x2={DM_L + DM_PW} y2={dmy(th.d)}
                  stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.6" />
                <text x={DM_L + DM_PW + 4} y={dmy(th.d) + 4}
                  fontSize="10" fill="#D97706" fontWeight="600"
                  textAnchor="start">{th.label}</text>
              </g>
            ))}

            {/* Full lines (always visible — the model is always a straight line) */}
            {/* 小强 */}
            <line x1={dmx(0)} y1={dmy(0)} x2={dmx(T_MAX)} y2={dmy(XQ_SPEED * T_MAX)}
              stroke="#F97316" strokeWidth="2" strokeDasharray="0" opacity="0.25" />
            {/* 小明 */}
            <line x1={dmx(0)} y1={dmy(0)} x2={dmx(T_MAX)} y2={dmy(XM_SPEED * T_MAX)}
              stroke="#0EA5E9" strokeWidth="2" strokeDasharray="0" opacity="0.25" />
            {/* Combined */}
            <line x1={dmx(0)} y1={dmy(0)} x2={dmx(T_MAX)} y2={dmy(Math.min(150 * T_MAX, D_MAX + 200))}
              stroke="#D97706" strokeWidth="2" strokeDasharray="0" opacity="0.2" />

            {/* Live drawn paths (up to current time) */}
            {time > 0 && (
              <>
                <line x1={dmx(0)} y1={dmy(0)} x2={dmx(time)} y2={dmy(xqDist)}
                  stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                <line x1={dmx(0)} y1={dmy(0)} x2={dmx(time)} y2={dmy(xmDist)}
                  stroke="#0EA5E9" strokeWidth="3" strokeLinecap="round" />
                <line x1={dmx(0)} y1={dmy(0)} x2={dmx(time)} y2={dmy(Math.min(combined, D_MAX + 100))}
                  stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
              </>
            )}

            {/* Meeting intersection markers */}
            {THRESHOLDS.filter(th => time >= th.t).map(th => {
              // Find where combined=th.d: t = th.d/150
              const mt = th.d / 150;
              return (
                <g key={`mi-${th.d}`}>
                  {/* Vertical drop from combined line to axis */}
                  <line x1={dmx(mt)} y1={dmy(th.d)} x2={dmx(mt)} y2={DM_T + DM_PH}
                    stroke="rgba(245,158,11,0.4)" strokeWidth="1" strokeDasharray="4 3" />
                  {/* Intersection dot on combined line */}
                  <circle cx={dmx(mt)} cy={dmy(th.d)} r="7"
                    fill="#F59E0B" stroke="white" strokeWidth="2" />
                  {/* Individual dots */}
                  <circle cx={dmx(mt)} cy={dmy(th.n === 1 ? 320 : 960)} r="5"
                    fill="#F97316" stroke="white" strokeWidth="1.5" />
                  <circle cx={dmx(mt)} cy={dmy(th.n === 1 ? 280 : 840)} r="5"
                    fill="#0EA5E9" stroke="white" strokeWidth="1.5" />
                  {/* Time label on axis */}
                  <text x={dmx(mt)} y={DM_T + DM_PH + 18}
                    textAnchor="middle" fontSize="11" fill="#D97706" fontWeight="700">
                    {mt}
                  </text>
                </g>
              );
            })}

            {/* Current time cursor */}
            {time > 0 && time < T_MAX && (
              <line x1={dmx(time)} y1={DM_T} x2={dmx(time)} y2={DM_T + DM_PH}
                stroke="rgba(0,0,0,0.15)" strokeDasharray="4 4" />
            )}

            {/* Current dots */}
            {time > 0 && (
              <>
                <circle cx={dmx(time)} cy={dmy(xqDist)} r="5"
                  fill="#F97316" stroke="white" strokeWidth="1.5" />
                <circle cx={dmx(time)} cy={dmy(xmDist)} r="5"
                  fill="#0EA5E9" stroke="white" strokeWidth="1.5" />
                <circle cx={dmx(time)} cy={dmy(Math.min(combined, D_MAX))} r="6"
                  fill="#D97706" stroke="white" strokeWidth="1.5" />
              </>
            )}

            {/* Legend */}
            <circle cx={DM_L + 8} cy={DM_T - 9} r="4" fill="#F97316" />
            <text x={DM_L + 17} y={DM_T - 5} fontSize="11" fill="#F97316" fontWeight="600">小强 80t</text>
            <circle cx={DM_L + 82} cy={DM_T - 9} r="4" fill="#0EA5E9" />
            <text x={DM_L + 91} y={DM_T - 5} fontSize="11" fill="#0EA5E9" fontWeight="600">小明 70t</text>
            <circle cx={DM_L + 156} cy={DM_T - 9} r="4" fill="#D97706" />
            <text x={DM_L + 165} y={DM_T - 5} fontSize="11" fill="#D97706" fontWeight="600">合计 150t</text>
          </svg>
        </div>
      </div>

      {/* ── Position decode ───────────────────────────────────────────────── */}
      {time >= MEET_2_T && (
        <div className="dm-decode">
          <div className="dm-decode__title">根据累计路程还原物理位置</div>
          <div className="dm-decode__row">
            <span style={{ color: "#F97316" }}>小强</span>
            走了 80×12 = <strong>960 m</strong>
            &nbsp;→&nbsp; 960 ÷ 1200 余 <strong>960</strong>（&gt;600，折返中）
            &nbsp;→&nbsp; 1200 − 960 = <strong>240 m</strong> ✓
          </div>
          <div className="dm-decode__row">
            <span style={{ color: "#0EA5E9" }}>小明</span>
            走了 70×12 = <strong>840 m</strong>
            &nbsp;→&nbsp; 840 ÷ 1200 余 <strong>840</strong>（&gt;600，折返中）
            &nbsp;→&nbsp; 距右端 1200 − 840 = 360 m，即距左端 <strong>240 m</strong> ✓
          </div>
        </div>
      )}
    </section>
  );
}
