import { useEffect, useMemo, useState } from "react";

type Point = { x: number; y: number };
type PolygonMode = "inscribed" | "both";

const MAX_SIDES = 200;
const MIN_SIDES = 3;
const DEFAULT_SIDES = 6;
const POLYGON_RADIUS = 100;
const DRAW_RADIUS = 82;
const DRAW_CENTER = 180;

const PI_PRESETS = [
  { label: "3", value: 3, input: "3" },
  { label: "3.1", value: 3.1, input: "3.1" },
  { label: "3.14", value: 3.14, input: "3.14" },
  { label: "3.1415", value: 3.1415, input: "3.1415" },
  { label: "22/7", value: 22 / 7, input: (22 / 7).toString() },
  { label: "真实 π", value: Math.PI, input: Math.PI.toString() }
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toPoints(points: Point[]) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function getPolygonPoints(radius: number, sides: number, center: number): Point[] {
  const safeSides = Math.max(MIN_SIDES, Math.round(sides));
  return Array.from({ length: safeSides }, (_, index) => {
    const angle = (Math.PI * 2 * index) / safeSides - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  });
}

function getInscribedPerimeter(radius: number, sides: number) {
  return 2 * sides * radius * Math.sin(Math.PI / sides);
}

function getInscribedArea(radius: number, sides: number) {
  return 0.5 * sides * radius * radius * Math.sin((2 * Math.PI) / sides);
}

function getCircumscribedPerimeter(radius: number, sides: number) {
  return 2 * sides * radius * Math.tan(Math.PI / sides);
}

function getCircumscribedArea(radius: number, sides: number) {
  return sides * radius * radius * Math.tan(Math.PI / sides);
}

function getCirclePerimeter(radius: number, piValue: number) {
  return 2 * piValue * radius;
}

function getCircleArea(radius: number, piValue: number) {
  return piValue * radius * radius;
}

function getAbsoluteError(a: number, b: number) {
  return Math.abs(a - b);
}

function getRelativeError(a: number, b: number) {
  if (a === 0) {
    return 0;
  }
  return Math.abs(a - b) / Math.abs(a);
}

function formatNumber(value: number, maxDigits = 4) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  const abs = Math.abs(value);
  if (abs > 0 && abs < 0.0001) {
    return "< 0.0001";
  }

  if (abs >= 1_000_000) {
    return value.toExponential(2);
  }

  return value.toLocaleString("zh-CN", {
    maximumFractionDigits: maxDigits,
    minimumFractionDigits: 0
  });
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(4)}%`;
}

function polygonInsight(sides: number) {
  if (sides <= 5) {
    return "边很少，每条边都偏长，所以和圆差得很明显。";
  }
  if (sides <= 12) {
    return "边变多后，轮廓开始贴近圆。";
  }
  if (sides <= 50) {
    return "每条边都更短了，越来越像一小段弧线。";
  }
  return "继续增加边数时，多边形会进一步逼近圆。";
}

function piInsight(piUsed: number) {
  if (Math.abs(piUsed - 3) < 1e-6) {
    return "把 π 当成 3，会让周长和面积都明显偏小。";
  }
  if (Math.abs(piUsed - 3.14) < 1e-6) {
    return "3.14 已经很接近了，计算误差会明显缩小。";
  }
  if (Math.abs(piUsed - 3.1415) < 1e-6) {
    return "3.1415 是常见近似值，日常计算常常够用，但仍不是完全精确的 π。";
  }
  if (Math.abs(piUsed - Math.PI) < 1e-10) {
    return "使用真实 π 时，计算结果与数学定义一致。";
  }
  return "圆本身没有变，改变的是我们算出来的近似程度。";
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CompareBar({ label, left, right }: { label: string; left: number; right: number }) {
  const base = Math.max(left, right, 1e-9);
  const leftWidth = `${(left / base) * 100}%`;
  const rightWidth = `${(right / base) * 100}%`;

  return (
    <div className="compare-bar">
      <div className="compare-bar__label">{label}</div>
      <div className="compare-bar__tracks">
        <div className="compare-bar__track">
          <span className="compare-bar__name">真实值</span>
          <span className="compare-bar__fill compare-bar__fill--real" style={{ width: leftWidth }} />
        </div>
        <div className="compare-bar__track">
          <span className="compare-bar__name">近似值</span>
          <span className="compare-bar__fill compare-bar__fill--used" style={{ width: rightWidth }} />
        </div>
      </div>
    </div>
  );
}

function PolygonModule() {
  const [sides, setSides] = useState(DEFAULT_SIDES);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<PolygonMode>("inscribed");
  const [showVertices, setShowVertices] = useState(true);

  useEffect(() => {
    if (!playing) {
      return;
    }
    if (sides >= MAX_SIDES) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setSides((current) => Math.min(MAX_SIDES, current + 1));
    }, 80);

    return () => window.clearTimeout(timer);
  }, [playing, sides]);

  const inscribedPoints = useMemo(
    () => getPolygonPoints(DRAW_RADIUS, sides, DRAW_CENTER),
    [sides]
  );

  const circumscribedPoints = useMemo(() => {
    const outRadius = DRAW_RADIUS / Math.cos(Math.PI / sides);
    return getPolygonPoints(outRadius, sides, DRAW_CENTER);
  }, [sides]);

  const circlePerimeter = getCirclePerimeter(POLYGON_RADIUS, Math.PI);
  const circleArea = getCircleArea(POLYGON_RADIUS, Math.PI);
  const inscribedPerimeter = getInscribedPerimeter(POLYGON_RADIUS, sides);
  const inscribedArea = getInscribedArea(POLYGON_RADIUS, sides);
  const perimeterError = circlePerimeter - inscribedPerimeter;
  const areaError = circleArea - inscribedArea;

  const circumscribedPerimeter = getCircumscribedPerimeter(POLYGON_RADIUS, sides);
  const circumscribedArea = getCircumscribedArea(POLYGON_RADIUS, sides);

  return (
    <section className="demo-card">
      <div className="demo-card__header">
        <h2>多边形，为什么能越来越像圆？</h2>
        <p>把边数慢慢增加，观察周长与面积如何一步步逼近。</p>
      </div>

      <div className="demo-grid">
        <div className="demo-visual">
          <svg viewBox="0 0 360 360" role="img" aria-label="多边形逼近圆的图形演示">
            <circle cx={DRAW_CENTER} cy={DRAW_CENTER} r={DRAW_RADIUS} className="shape-circle" />

            {mode === "both" ? (
              <polygon points={toPoints(circumscribedPoints)} className="shape-polygon shape-polygon--outer" />
            ) : null}

            <polygon points={toPoints(inscribedPoints)} className="shape-polygon shape-polygon--inner" />

            {showVertices
              ? inscribedPoints.map((point, index) => (
                  <circle
                    key={`${point.x}-${point.y}`}
                    cx={point.x}
                    cy={point.y}
                    r={2.2}
                    className="shape-vertex"
                    aria-label={`顶点 ${index + 1}`}
                  />
                ))
              : null}

            <text x="24" y="30" className="shape-label">
              n = {sides}
            </text>
          </svg>

          <div className="insight-pill">{polygonInsight(sides)}</div>
        </div>

        <div className="demo-controls">
          <div className="control-group">
            <label htmlFor="sides-range">边数 n: {sides}</label>
            <input
              id="sides-range"
              type="range"
              min={MIN_SIDES}
              max={MAX_SIDES}
              step={1}
              value={sides}
              onChange={(event) => {
                setSides(clamp(Number(event.target.value), MIN_SIDES, MAX_SIDES));
                setPlaying(false);
              }}
            />
            <div className="quick-buttons">
              {[3, 4, 6, 12, 30, 100].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={value === sides ? "chip chip--active" : "chip"}
                  onClick={() => {
                    setSides(value);
                    setPlaying(false);
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="control-row">
            <button type="button" className="btn" onClick={() => setPlaying((v) => !v)}>
              {playing ? "暂停" : "播放"}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setPlaying(false);
                setSides(DEFAULT_SIDES);
              }}
            >
              重置
            </button>
          </div>

          <div className="control-row control-row--stack">
            <div className="segmented" role="group" aria-label="显示模式">
              <button
                type="button"
                className={mode === "inscribed" ? "segmented__item segmented__item--active" : "segmented__item"}
                onClick={() => setMode("inscribed")}
              >
                圆 + 内接
              </button>
              <button
                type="button"
                className={mode === "both" ? "segmented__item segmented__item--active" : "segmented__item"}
                onClick={() => setMode("both")}
              >
                内接 + 外切
              </button>
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={showVertices}
                onChange={(event) => setShowVertices(event.target.checked)}
              />
              <span>显示顶点</span>
            </label>
          </div>

          <div className="metrics-panel">
            <MetricRow label="半径 r" value={formatNumber(POLYGON_RADIUS)} />
            <MetricRow label="圆周长 2πr" value={formatNumber(circlePerimeter)} />
            <MetricRow label="内接周长 P_in" value={formatNumber(inscribedPerimeter)} />
            <MetricRow label="周长误差 C - P_in" value={formatNumber(perimeterError)} />
            <MetricRow label="圆面积 πr²" value={formatNumber(circleArea)} />
            <MetricRow label="内接面积 A_in" value={formatNumber(inscribedArea)} />
            <MetricRow label="面积误差 A - A_in" value={formatNumber(areaError)} />
            {mode === "both" ? (
              <>
                <MetricRow label="外切周长 P_out" value={formatNumber(circumscribedPerimeter)} />
                <MetricRow label="外切面积 A_out" value={formatNumber(circumscribedArea)} />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <p className="cognitive-tip">
        圆不是由多边形“组成”的。这里展示的是：边越来越多时，多边形的周长和面积会越来越接近圆。
      </p>
    </section>
  );
}

function PiApproxModule() {
  const [radius, setRadius] = useState(10);
  const [piInput, setPiInput] = useState("3.1415");

  const piUsed = useMemo(() => {
    const value = Number(piInput);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    return value;
  }, [piInput]);

  const realPerimeter = getCirclePerimeter(radius, Math.PI);
  const realArea = getCircleArea(radius, Math.PI);

  const usedPerimeter = piUsed === null ? null : getCirclePerimeter(radius, piUsed);
  const usedArea = piUsed === null ? null : getCircleArea(radius, piUsed);

  const perimeterAbsError =
    usedPerimeter === null ? null : getAbsoluteError(usedPerimeter, realPerimeter);
  const perimeterRelError =
    usedPerimeter === null ? null : getRelativeError(realPerimeter, usedPerimeter);

  const areaAbsError = usedArea === null ? null : getAbsoluteError(usedArea, realArea);
  const areaRelError = usedArea === null ? null : getRelativeError(realArea, usedArea);

  return (
    <section className="demo-card">
      <div className="demo-card__header">
        <h2>如果计算时把 π 当成 3.1415，会怎样？</h2>
        <p>圆没有变，变的是我们算出来的结果有多接近真实值。</p>
      </div>

      <div className="demo-grid">
        <div className="demo-visual demo-visual--pi">
          <svg viewBox="0 0 360 260" role="img" aria-label="圆保持不变的可视化">
            <defs>
              <radialGradient id="piGlow" cx="50%" cy="35%" r="68%">
                <stop offset="0%" stopColor="#fff7d9" />
                <stop offset="100%" stopColor="#ffd37c" />
              </radialGradient>
            </defs>
            <rect x="20" y="26" width="320" height="208" rx="18" className="pi-stage" />
            <circle cx="120" cy="130" r="72" className="shape-circle" />
            <circle cx="120" cy="130" r="51" fill="url(#piGlow)" opacity="0.72" />
            <text x="120" y="130" dominantBaseline="middle" textAnchor="middle" className="pi-stage__text">
              圆保持不变
            </text>
            <text x="230" y="98" className="pi-stage__meta">
              π(真实) = {formatNumber(Math.PI, 6)}
            </text>
            <text x="230" y="130" className="pi-stage__meta">
              π(当前) = {piUsed === null ? "-" : formatNumber(piUsed, 6)}
            </text>
            <text x="230" y="162" className="pi-stage__meta">
              半径 r = {radius}
            </text>
          </svg>

          {piUsed !== null ? <div className="insight-pill">{piInsight(piUsed)}</div> : null}
        </div>

        <div className="demo-controls">
          <div className="control-group">
            <label htmlFor="radius-range">半径 r: {radius}</label>
            <input
              id="radius-range"
              type="range"
              min={1}
              max={200}
              step={1}
              value={radius}
              onChange={(event) => {
                setRadius(clamp(Number(event.target.value), 1, 200));
              }}
            />
          </div>

          <div className="control-group">
            <label htmlFor="pi-input">π 近似值</label>
            <input
              id="pi-input"
              type="text"
              inputMode="decimal"
              value={piInput}
              onChange={(event) => setPiInput(event.target.value.trim())}
              placeholder="请输入正数"
            />

            <div className="quick-buttons">
              {PI_PRESETS.map((preset) => {
                const active = piUsed !== null && Math.abs(piUsed - preset.value) < 1e-10;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    className={active ? "chip chip--active" : "chip"}
                    onClick={() => setPiInput(preset.input)}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {piUsed === null ? <p className="input-error">请输入一个大于 0 的数字。</p> : null}
          </div>

          <div className="control-row">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setRadius(10);
                setPiInput("3.1415");
              }}
            >
              重置到默认
            </button>
          </div>

          <div className="metrics-panel">
            <MetricRow label="真实周长 C_real" value={formatNumber(realPerimeter)} />
            <MetricRow label="近似周长 C_used" value={usedPerimeter === null ? "-" : formatNumber(usedPerimeter)} />
            <MetricRow
              label="周长绝对误差"
              value={perimeterAbsError === null ? "-" : formatNumber(perimeterAbsError)}
            />
            <MetricRow
              label="周长相对误差"
              value={perimeterRelError === null ? "-" : formatPercent(perimeterRelError)}
            />
            <MetricRow label="真实面积 A_real" value={formatNumber(realArea)} />
            <MetricRow label="近似面积 A_used" value={usedArea === null ? "-" : formatNumber(usedArea)} />
            <MetricRow
              label="面积绝对误差"
              value={areaAbsError === null ? "-" : formatNumber(areaAbsError)}
            />
            <MetricRow
              label="面积相对误差"
              value={areaRelError === null ? "-" : formatPercent(areaRelError)}
            />
          </div>

          {usedPerimeter !== null && usedArea !== null ? (
            <div className="compare-bars">
              <CompareBar label="周长对比" left={realPerimeter} right={usedPerimeter} />
              <CompareBar label="面积对比" left={realArea} right={usedArea} />
            </div>
          ) : null}
        </div>
      </div>

      <p className="cognitive-tip">
        改变 π 的写法，不会让圆消失。改变的是：我们用公式算出来的结果有多接近真实值。
      </p>
    </section>
  );
}

export default function App() {
  return (
    <main className="pi-app">
      <header className="hero">
        <p className="hero__eyebrow">PI INTERACTIVE DEMO</p>
        <h1>圆，为什么能被多边形逼近？</h1>
        <p>再试试：如果把 π 当成 3.1415，会发生什么？</p>
      </header>

      <PolygonModule />

      <section className="bridge">
        <p>
          上一个模块看形状如何逼近。这个模块继续追问：当我们真正去计算圆时，为什么会出现 π
          这样的近似问题？
        </p>
      </section>

      <PiApproxModule />

      <section className="summary">
        <h3>两个“逼近”</h3>
        <ul>
          <li>在形状上，多边形可以逼近圆。</li>
          <li>在计算上，有限小数可以逼近 π。</li>
          <li>很多连续对象，都是通过“越来越接近”来理解的。</li>
        </ul>
      </section>
    </main>
  );
}
