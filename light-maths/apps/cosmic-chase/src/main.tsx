import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "idle" | "running" | "done";

interface SliderProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  color?: string;
  onChange: (v: number) => void;
}

interface ChartProps {
  catchTime: number;
  initialGap: number;
  relativeSpeed: number;
  simTime: number;
  canChase: boolean;
  phase: Phase;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ANIM_REAL_SECS = 8;

const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: (Math.sin(i * 127.1) * 0.5 + 0.5) * 100,
  y: (Math.sin(i * 311.7) * 0.5 + 0.5) * 100,
  r: (Math.sin(i * 53.3) * 0.5 + 0.5) * 1.5 + 0.4,
  opacity: (Math.sin(i * 71.9) * 0.5 + 0.5) * 0.55 + 0.25,
  delay: (Math.sin(i * 19.7) * 0.5 + 0.5) * 4
}));

// ─── StarField ───────────────────────────────────────────────────────────────

function StarField() {
  return (
    <div className="starfield" aria-hidden="true">
      {STARS.map((s) => (
        <div
          key={s.id}
          className="star"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.r * 2}px`,
              height: `${s.r * 2}px`,
              "--base-opacity": s.opacity,
              animationDelay: `${s.delay}s`
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// ─── ParamSlider ─────────────────────────────────────────────────────────────

function ParamSlider({ label, unit, value, min, max, step, disabled, color, onChange }: SliderProps) {
  return (
    <label className="param-slider">
      <div className="param-header">
        <span className="param-label">{label}</span>
        <span className="param-value" style={color ? { color } : undefined}>
          {value} <small>{unit}</small>
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={color ? ({ "--thumb-color": color } as React.CSSProperties) : undefined}
      />
    </label>
  );
}

// ─── ChaseChart ──────────────────────────────────────────────────────────────

function ChaseChart({ catchTime, initialGap, relativeSpeed, simTime, canChase, phase }: ChartProps) {
  const [showRem, setShowRem] = useState(true);
  const [showCaught, setShowCaught] = useState(true);

  if (!isFinite(catchTime) || catchTime <= 0) {
    return <div className="chart-empty">调整参数，让三体飞船速度大于人类飞船速度</div>;
  }

  const W = 380, H = 240;
  const ML = 52, MR = 20, MT = 20, MB = 42;
  const IW = W - ML - MR;
  const IH = H - MT - MB;

  const xMax = catchTime * 1.05;
  const yMax = initialGap * 1.05;
  const xs = (t: number) => (t / xMax) * IW;
  const ys = (d: number) => IH - (d / yMax) * IH;

  const ct = Math.min(simTime, catchTime);
  const curRem = Math.max(initialGap - relativeSpeed * ct, 0);
  const curCaught = Math.min(relativeSpeed * ct, initialGap);

  const xTicks = [1, 2, 3, 4, 5].map((i) => Math.round((catchTime / 5) * i * 10) / 10);
  const yTicks = [1, 2, 3, 4].map((i) => Math.round((initialGap / 4) * i));

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        className="chase-chart"
        aria-label="追及距离函数图"
      >
        <defs>
          <clipPath id="cc-clip">
            <rect x={0} y={0} width={IW} height={IH} />
          </clipPath>
        </defs>
        <g transform={`translate(${ML},${MT})`}>
          {/* Grid */}
          {xTicks.map((t) => (
            <line key={`gx-${t}`} x1={xs(t)} y1={0} x2={xs(t)} y2={IH}
              stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          ))}
          {yTicks.map((d) => (
            <line key={`gy-${d}`} x1={0} y1={ys(d)} x2={IW} y2={ys(d)}
              stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          ))}

          <g clipPath="url(#cc-clip)">
            {/* Remaining distance line */}
            {showRem && (
              <line x1={xs(0)} y1={ys(initialGap)} x2={xs(catchTime)} y2={ys(0)}
                stroke="#ff7043" strokeWidth={2.5} strokeLinecap="round" />
            )}
            {/* Caught-up line */}
            {showCaught && (
              <line x1={xs(0)} y1={ys(0)} x2={xs(catchTime)} y2={ys(initialGap)}
                stroke="#26c6da" strokeWidth={2.5} strokeLinecap="round" />
            )}

            {/* Current time indicator */}
            {simTime > 0 && (
              <>
                <line x1={xs(ct)} y1={0} x2={xs(ct)} y2={IH}
                  stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeDasharray="4 3" />
                {showRem && (
                  <circle cx={xs(ct)} cy={ys(curRem)} r={5}
                    fill="#ff7043" stroke="white" strokeWidth={1.5} />
                )}
                {showCaught && (
                  <circle cx={xs(ct)} cy={ys(curCaught)} r={5}
                    fill="#26c6da" stroke="white" strokeWidth={1.5} />
                )}
              </>
            )}

            {/* Catch point */}
            {simTime >= catchTime && (
              <circle cx={xs(catchTime)} cy={ys(0)} r={7}
                fill="#ffd740" stroke="white" strokeWidth={2} />
            )}
          </g>

          {/* Axes */}
          <line x1={0} y1={IH} x2={IW} y2={IH} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
          <line x1={0} y1={0} x2={0} y2={IH} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />

          {/* X ticks */}
          {xTicks.map((t) => (
            <g key={`tx-${t}`} transform={`translate(${xs(t)},${IH})`}>
              <line y1={0} y2={4} stroke="rgba(255,255,255,0.5)" />
              <text y={15} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={10}>{t}</text>
            </g>
          ))}
          <text x={IW / 2} y={IH + 34} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={11}>
            时间 t（分钟）
          </text>

          {/* Y ticks */}
          {yTicks.map((d) => (
            <g key={`ty-${d}`} transform={`translate(0,${ys(d)})`}>
              <line x1={-4} x2={0} stroke="rgba(255,255,255,0.5)" />
              <text x={-7} textAnchor="end" dominantBaseline="middle" fill="rgba(255,255,255,0.55)" fontSize={10}>{d}</text>
            </g>
          ))}
          <text transform={`translate(${-ML + 13},${IH / 2}) rotate(-90)`}
            textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={11}>
            距离（km）
          </text>

          {/* Clickable legend */}
          <g transform={`translate(${IW - 120}, 4)`}>
            <rect width={120} height={50} rx={5} fill="rgba(0,0,0,0.5)" />
            {/* Remaining toggle */}
            <g className="legend-item" opacity={showRem ? 1 : 0.38}
              onClick={() => setShowRem((v) => !v)}
              style={{ cursor: "pointer" }}>
              <rect x={0} y={0} width={120} height={25} fill="transparent" />
              <line x1={8} y1={13} x2={26} y2={13}
                stroke="#ff7043" strokeWidth={showRem ? 2.5 : 1.5}
                strokeDasharray={showRem ? undefined : "4 3"} />
              <text x={31} y={17} fill={showRem ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)"} fontSize={10}>
                剩余距离
              </text>
            </g>
            {/* Caught toggle */}
            <g className="legend-item" opacity={showCaught ? 1 : 0.38}
              onClick={() => setShowCaught((v) => !v)}
              style={{ cursor: "pointer" }}>
              <rect x={0} y={25} width={120} height={25} fill="transparent" />
              <line x1={8} y1={38} x2={26} y2={38}
                stroke="#26c6da" strokeWidth={showCaught ? 2.5 : 1.5}
                strokeDasharray={showCaught ? undefined : "4 3"} />
              <text x={31} y={42} fill={showCaught ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)"} fontSize={10}>
                已追赶距离
              </text>
            </g>
          </g>
        </g>
      </svg>

      {/* Formula */}
      {canChase && (
        <div className="formula-box">
          {showRem && (
            <div className="formula-line">
              <span className="formula-label" style={{ color: "#ff7043" }}>剩余距离</span>
              <span className="formula-eq">= {initialGap} &minus; {relativeSpeed} &times; t</span>
            </div>
          )}
          {showCaught && (
            <div className="formula-line">
              <span className="formula-label" style={{ color: "#26c6da" }}>已追赶</span>
              <span className="formula-eq">= {relativeSpeed} &times; t</span>
            </div>
          )}
          {phase === "done" && (
            <div className="formula-note">
              t = {catchTime.toFixed(1)} 时，剩余距离 = 0 ✓
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function CosmicChaseApp() {
  const [headStart, setHeadStart] = useState(5);
  const [humanSpeed, setHumanSpeed] = useState(40);
  const [triSpeed, setTriSpeed] = useState(60);
  const [phase, setPhase] = useState<Phase>("idle");
  const [simTime, setSimTime] = useState(0);

  const rafRef = useRef<number>(0);
  const startRealRef = useRef<number>(0);
  const animSpeedRef = useRef<number>(1);
  const catchTimeRef = useRef<number>(Infinity);
  const runningRef = useRef<boolean>(false);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  // Core math
  const initialGap = headStart * humanSpeed;
  const relativeSpeed = triSpeed - humanSpeed;
  const catchTime = relativeSpeed > 0 ? initialGap / relativeSpeed : Infinity;
  const canChase = triSpeed > humanSpeed;

  catchTimeRef.current = catchTime;

  const ct = Math.min(simTime, isFinite(catchTime) ? catchTime : 0);
  const caughtUp = Math.round(Math.min(relativeSpeed * ct, initialGap));
  const remaining = Math.round(Math.max(initialGap - relativeSpeed * ct, 0));

  // Ship positions on track [0, 1]
  const trackMax = isFinite(catchTime) ? triSpeed * catchTime * 1.1 : triSpeed * 30;
  const humanFrac = Math.min((initialGap + humanSpeed * ct) / trackMax, 1);
  const triFrac = Math.min((triSpeed * ct) / trackMax, 1);

  // Animation loop
  const animate = useCallback((ts: number) => {
    if (!runningRef.current) return;
    if (startRealRef.current === 0) startRealRef.current = ts;
    const elapsed = (ts - startRealRef.current) / 1000;
    const next = elapsed * animSpeedRef.current;
    const limit = catchTimeRef.current;
    if (next >= limit) {
      setSimTime(limit);
      setPhase("done");
      runningRef.current = false;
      return;
    }
    setSimTime(next);
    rafRef.current = requestAnimationFrame(animate);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const doStart = () => {
    if (!canChase || !isFinite(catchTime)) return;
    cancelAnimationFrame(rafRef.current);
    animSpeedRef.current = catchTime / ANIM_REAL_SECS;
    catchTimeRef.current = catchTime;
    startRealRef.current = 0;
    runningRef.current = true;
    setSimTime(0);
    setPhase("running");
    rafRef.current = requestAnimationFrame(animate);
  };

  const doReset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    runningRef.current = false;
    setSimTime(0);
    setPhase("idle");
  }, []);

  const changeParam = (setter: (v: number) => void) => (v: number) => {
    cancelAnimationFrame(rafRef.current);
    runningRef.current = false;
    setSimTime(0);
    setPhase("idle");
    setter(v);
  };

  // Table data
  const tableData = useMemo(() => {
    if (!isFinite(catchTime) || catchTime <= 0) return [];
    const step = Math.max(1, Math.ceil(catchTime / 15));
    const rows: { t: number; caught: number; rem: number }[] = [];
    for (let t = 0; t <= catchTime + 0.001; t += step) {
      const clamped = Math.min(t, catchTime);
      rows.push({
        t: Math.round(clamped * 10) / 10,
        caught: Math.round(Math.min(relativeSpeed * clamped, initialGap)),
        rem: Math.round(Math.max(initialGap - relativeSpeed * clamped, 0))
      });
    }
    return rows;
  }, [catchTime, relativeSpeed, initialGap]);

  const currentRowIdx = useMemo(() => {
    if (simTime === 0 || tableData.length === 0) return -1;
    for (let i = tableData.length - 1; i >= 0; i--) {
      if (simTime >= tableData[i].t) return i;
    }
    return 0;
  }, [simTime, tableData]);

  useEffect(() => {
    if (currentRowIdx < 0 || !tableBodyRef.current) return;
    const row = tableBodyRef.current.children[currentRowIdx] as HTMLElement;
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentRowIdx]);

  const paramsSummary = `先出发 ${headStart} min · 人类 ${humanSpeed} · 三体 ${triSpeed} km/min`;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-text">
          <h1>🛸 宇宙追及实验室</h1>
          <p>让三体飞船追上人类飞船，发现函数规律</p>
        </div>
        <div className="header-badge">小学·路程问题</div>
      </header>

      {/* Action bar */}
      <div className="action-bar">
        <button
          className={`btn btn-start${phase === "running" ? " btn-stop" : ""}`}
          onClick={phase === "running" ? doReset : doStart}
          disabled={!canChase}
        >
          {phase === "running" ? "⏹ 停止" : "▶ 开始追赶"}
        </button>
        <button className="btn btn-reset" onClick={doReset}>
          ↺ 重置
        </button>
        {!canChase && (
          <span className="warn-text">⚠ 三体飞船速度需大于人类飞船速度</span>
        )}
      </div>

      {/* Collapsible params */}
      <details className="params-panel">
        <summary className="params-summary">
          <span className="params-icon">⚙</span>
          <span className="params-title">参数设置</span>
          <span className="params-preview">{paramsSummary}</span>
          {phase === "running" && <span className="params-locked">🔒 动画中</span>}
        </summary>
        <div className="params-body">
          <div className="sliders-grid">
            <ParamSlider
              label="先出发时间" unit="分钟"
              value={headStart} min={1} max={15} step={1}
              disabled={phase === "running"}
              onChange={changeParam(setHeadStart)}
            />
            <ParamSlider
              label="人类飞船速度" unit="km/min"
              value={humanSpeed} min={10} max={80} step={5}
              color="#4fc3f7"
              disabled={phase === "running"}
              onChange={changeParam(setHumanSpeed)}
            />
            <ParamSlider
              label="三体飞船速度" unit="km/min"
              value={triSpeed} min={15} max={100} step={5}
              color="#ff7043"
              disabled={phase === "running"}
              onChange={changeParam(setTriSpeed)}
            />
          </div>
          <div className="derived-row">
            <div className="derived-item">
              <span>初始相距</span>
              <strong>{initialGap} km</strong>
            </div>
            <div className="derived-item">
              <span>每分钟追近</span>
              <strong className={canChase ? "val-cyan" : "val-warn"}>
                {canChase ? `${relativeSpeed} km` : "无法追上"}
              </strong>
            </div>
            <div className="derived-item">
              <span>追及时间</span>
              <strong>{canChase ? `${catchTime.toFixed(1)} 分钟` : "—"}</strong>
            </div>
          </div>
        </div>
      </details>

      {/* Demo area */}
      <section className="demo-section">
        <div className="demo-canvas">
          <StarField />
          <div className="track-rail">
            {remaining > 0 && phase !== "idle" && (
              <div
                className="gap-bar"
                style={{ left: `${triFrac * 100}%`, width: `${(humanFrac - triFrac) * 100}%` }}
              >
                <span className="gap-label">{remaining} km</span>
              </div>
            )}
            <div className="ship ship-tri" style={{ left: `${triFrac * 100}%` }}>
              <span className="ship-emoji">🛸</span>
              <span className="ship-tag tag-tri">三体</span>
            </div>
            <div className="ship ship-human" style={{ left: `${humanFrac * 100}%` }}>
              <span className="ship-emoji">🚀</span>
              <span className="ship-tag tag-human">人类</span>
            </div>
          </div>
          {phase === "done" && (
            <div className="catch-flash">🎉 第 {catchTime.toFixed(1)} 分钟追上！</div>
          )}
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-name">追赶时间</span>
            <span className="stat-val">{ct.toFixed(1)}<small>分钟</small></span>
          </div>
          <div className="stat-card stat-caught">
            <span className="stat-name">已追赶</span>
            <span className="stat-val">{caughtUp}<small>km</small></span>
          </div>
          <div className="stat-card stat-rem">
            <span className="stat-name">剩余距离</span>
            <span className="stat-val">{remaining}<small>km</small></span>
          </div>
        </div>
      </section>

      {/* Analysis */}
      <section className="analysis-section">
        <div className="table-panel">
          <h3 className="panel-title">时间记录表</h3>
          {tableData.length === 0 ? (
            <p className="panel-empty">请先设置有效参数</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>t（分）</th>
                    <th className="th-cyan">已追赶（km）</th>
                    <th className="th-orange">剩余（km）</th>
                  </tr>
                </thead>
                <tbody ref={tableBodyRef}>
                  {tableData.map((row, i) => (
                    <tr key={row.t} className={i === currentRowIdx ? "row-active" : ""}>
                      <td className="td-t">{row.t}</td>
                      <td className="td-caught">{row.caught}</td>
                      <td className="td-rem">{row.rem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="chart-panel">
          <h3 className="panel-title">函数图像 <small className="panel-hint">点击图例可隐藏/显示曲线</small></h3>
          <ChaseChart
            catchTime={catchTime}
            initialGap={initialGap}
            relativeSpeed={relativeSpeed}
            simTime={ct}
            canChase={canChase}
            phase={phase}
          />
        </div>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CosmicChaseApp />
  </React.StrictMode>
);
