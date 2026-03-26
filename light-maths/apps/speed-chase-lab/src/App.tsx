import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Gauge,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  TimerReset
} from "lucide-react";

type ChaseParams = {
  leadTime: number;
  humanSpeed: number;
  chaserSpeed: number;
};

type ChaseSample = {
  time: number;
  closed: number;
  remaining: number;
  humanDistance: number;
  chaserDistance: number;
};

const DEFAULT_PARAMS: ChaseParams = {
  leadTime: 5,
  humanSpeed: 40,
  chaserSpeed: 60
};

const PRESETS: Array<{ label: string; note: string; params: ChaseParams }> = [
  {
    label: "课本情境",
    note: "5 分钟先出发，60 追 40",
    params: DEFAULT_PARAMS
  },
  {
    label: "快速追上",
    note: "差速更大，几分钟内追上",
    params: { leadTime: 3, humanSpeed: 35, chaserSpeed: 75 }
  },
  {
    label: "追不上",
    note: "追赶者更慢，会越拉越远",
    params: { leadTime: 5, humanSpeed: 50, chaserSpeed: 38 }
  }
];

const STARS = [
  { left: "6%", top: "16%", size: 3, delay: "0.3s" },
  { left: "12%", top: "62%", size: 2, delay: "0.8s" },
  { left: "18%", top: "28%", size: 4, delay: "0.4s" },
  { left: "26%", top: "74%", size: 2, delay: "1.2s" },
  { left: "34%", top: "20%", size: 3, delay: "1.8s" },
  { left: "42%", top: "56%", size: 2, delay: "1.1s" },
  { left: "48%", top: "12%", size: 3, delay: "1.5s" },
  { left: "57%", top: "68%", size: 4, delay: "0.6s" },
  { left: "65%", top: "22%", size: 2, delay: "1.6s" },
  { left: "73%", top: "48%", size: 3, delay: "0.9s" },
  { left: "82%", top: "18%", size: 2, delay: "1.4s" },
  { left: "88%", top: "60%", size: 4, delay: "0.2s" },
  { left: "93%", top: "30%", size: 3, delay: "1.9s" }
];

const PLAYBACK_RATE = 1.25;
const FALLBACK_DURATION = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createSample(params: ChaseParams, time: number): ChaseSample {
  const initialGap = params.leadTime * params.humanSpeed;
  const relativeSpeed = params.chaserSpeed - params.humanSpeed;
  const closed = relativeSpeed * time;
  const remaining = initialGap - closed;

  return {
    time,
    closed,
    remaining,
    humanDistance: params.humanSpeed * (params.leadTime + time),
    chaserDistance: params.chaserSpeed * time
  };
}

function getCatchTime(params: ChaseParams) {
  const initialGap = params.leadTime * params.humanSpeed;
  const relativeSpeed = params.chaserSpeed - params.humanSpeed;

  if (relativeSpeed <= 0) {
    return null;
  }

  return initialGap / relativeSpeed;
}

function getTimelineEnd(params: ChaseParams) {
  const catchTime = getCatchTime(params);

  if (catchTime === null) {
    return FALLBACK_DURATION;
  }

  return clamp(Number(catchTime.toFixed(2)), 4, 18);
}

function formatDistance(distance: number) {
  return `${distance.toFixed(1)} km`;
}

function formatMinutes(minutes: number) {
  return `${minutes.toFixed(1)} 分钟`;
}

function buildLinePath(
  samples: ChaseSample[],
  width: number,
  left: number,
  top: number,
  plotWidth: number,
  plotHeight: number,
  minY: number,
  maxY: number,
  getValue: (sample: ChaseSample) => number
) {
  return samples
    .map((sample, index) => {
      const x = left + (sample.time / width) * plotWidth;
      const y = top + ((maxY - getValue(sample)) / (maxY - minY)) * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  description,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="control-slider">
      <div className="control-slider__topline">
        <div>
          <span>{label}</span>
          <strong>{description}</strong>
        </div>
        <b>
          {value}
          {unit}
        </b>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="control-slider__scale">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </label>
  );
}

function ShipIcon({ variant }: { variant: "human" | "trisolaran" }) {
  if (variant === "human") {
    return (
      <svg viewBox="0 0 120 56" aria-hidden="true">
        <defs>
          <linearGradient id="humanBody" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#ffd36f" />
            <stop offset="100%" stopColor="#ff7b54" />
          </linearGradient>
        </defs>
        <path
          d="M14 28c0-8 10-15 30-18l28 5 14 13-14 13-28 5C24 43 14 36 14 28Z"
          fill="url(#humanBody)"
        />
        <path d="M86 18 111 28 86 38 88 28Z" fill="#fff4d7" opacity="0.9" />
        <circle cx="48" cy="28" r="8" fill="#10203d" />
        <path d="M8 20 16 28 8 36 0 28Z" fill="#8ed6ff" opacity="0.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 56" aria-hidden="true">
      <defs>
        <linearGradient id="triBody" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#97f9ff" />
          <stop offset="100%" stopColor="#4fd1c5" />
        </linearGradient>
      </defs>
      <path d="M8 28 36 10h44l24 18-24 18H36Z" fill="url(#triBody)" />
      <path d="M104 18 118 28l-14 10-7-10Z" fill="#d8ffff" />
      <circle cx="56" cy="28" r="7" fill="#06263e" />
      <path d="M8 28 0 20v16Z" fill="#7cf6ff" opacity="0.75" />
    </svg>
  );
}

function TrendChart({
  samples,
  current,
  timelineEnd
}: {
  samples: ChaseSample[];
  current: ChaseSample;
  timelineEnd: number;
}) {
  const chartWidth = 620;
  const chartHeight = 320;
  const marginLeft = 56;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 42;
  const plotWidth = chartWidth - marginLeft - marginRight;
  const plotHeight = chartHeight - marginTop - marginBottom;

  const allValues = [
    ...samples.flatMap((sample) => [sample.closed, sample.remaining]),
    current.closed,
    current.remaining,
    0
  ];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const padding = Math.max(20, (rawMax - rawMin) * 0.12 || 40);
  const minY = rawMin - padding;
  const maxY = rawMax + padding;
  const toX = (time: number) => marginLeft + (time / timelineEnd) * plotWidth;
  const toY = (value: number) =>
    marginTop + ((maxY - value) / (maxY - minY)) * plotHeight;

  const remainingPath = buildLinePath(
    samples,
    timelineEnd,
    marginLeft,
    marginTop,
    plotWidth,
    plotHeight,
    minY,
    maxY,
    (sample) => sample.remaining
  );
  const closedPath = buildLinePath(
    samples,
    timelineEnd,
    marginLeft,
    marginTop,
    plotWidth,
    plotHeight,
    minY,
    maxY,
    (sample) => sample.closed
  );

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    return maxY - (maxY - minY) * ratio;
  });
  const xTicks = Array.from({ length: 5 }, (_, index) =>
    Number(((timelineEnd / 4) * index).toFixed(1))
  );

  return (
    <div className="chart-shell">
      <div className="chart-shell__legend">
        <span>
          <i className="legend-dot legend-dot--teal" />
          已追赶距离
        </span>
        <span>
          <i className="legend-dot legend-dot--gold" />
          剩余相距
        </span>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="距离变化曲线图">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={marginLeft}
              y1={toY(tick)}
              x2={chartWidth - marginRight}
              y2={toY(tick)}
              stroke="rgba(140, 170, 255, 0.15)"
              strokeDasharray="5 7"
            />
            <text x={12} y={toY(tick) + 4} fill="rgba(226, 232, 240, 0.74)" fontSize="11">
              {tick.toFixed(0)} km
            </text>
          </g>
        ))}

        {xTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={toX(tick)}
              y1={marginTop}
              x2={toX(tick)}
              y2={chartHeight - marginBottom}
              stroke="rgba(140, 170, 255, 0.08)"
            />
            <text
              x={toX(tick)}
              y={chartHeight - 12}
              fill="rgba(226, 232, 240, 0.74)"
              fontSize="11"
              textAnchor="middle"
            >
              {tick.toFixed(0)} min
            </text>
          </g>
        ))}

        <line
          x1={marginLeft}
          y1={toY(0)}
          x2={chartWidth - marginRight}
          y2={toY(0)}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
        />

        <path d={closedPath} fill="none" stroke="#6fffe9" strokeWidth="4" strokeLinecap="round" />
        <path
          d={remainingPath}
          fill="none"
          stroke="#ffd166"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <line
          x1={toX(current.time)}
          y1={marginTop}
          x2={toX(current.time)}
          y2={chartHeight - marginBottom}
          stroke="rgba(255,255,255,0.32)"
          strokeDasharray="6 6"
        />

        <circle cx={toX(current.time)} cy={toY(current.closed)} r="7" fill="#6fffe9" />
        <circle cx={toX(current.time)} cy={toY(current.remaining)} r="7" fill="#ffd166" />
      </svg>

      <p className="chart-shell__note">横轴是追赶开始后的时间 t。负的“已追赶距离”表示没有追近，反而被甩开了。</p>
    </div>
  );
}

export default function App() {
  const [params, setParams] = useState<ChaseParams>(DEFAULT_PARAMS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const frameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const initialGap = params.leadTime * params.humanSpeed;
  const relativeSpeed = params.chaserSpeed - params.humanSpeed;
  const catchTime = getCatchTime(params);
  const timelineEnd = getTimelineEnd(params);
  const tableSamples = Array.from({ length: Math.ceil(timelineEnd) + 1 }, (_, index) =>
    createSample(params, index)
  );
  const chartSamples = Array.from({ length: Math.floor(timelineEnd) + 1 }, (_, index) =>
    createSample(params, index)
  );
  if (Math.abs(chartSamples[chartSamples.length - 1].time - timelineEnd) > 0.001) {
    chartSamples.push(createSample(params, timelineEnd));
  }
  const current = createSample(params, currentTime);
  const stageMaxDistance = Math.max(
    420,
    ...tableSamples.map((sample) => Math.max(sample.humanDistance, sample.chaserDistance)),
    current.humanDistance,
    current.chaserDistance
  );
  const humanProgress = clamp(current.humanDistance / stageMaxDistance, 0, 1);
  const chaserProgress = clamp(current.chaserDistance / stageMaxDistance, 0, 1);
  const gapProgress = clamp(humanProgress - chaserProgress, 0, 1);
  const closestIndex = Math.min(tableSamples.length - 1, Math.round(currentTime));
  const canCatch = catchTime !== null;
  const isCaught = canCatch && current.remaining <= 0;
  const timeAtEnd = currentTime >= timelineEnd - 0.001;
  const trackStart = 6;
  const trackSpan = 88;
  const toTrackPercent = (progress: number) => `${trackStart + progress * trackSpan}%`;

  useEffect(() => {
    if (!isRunning) {
      lastTickRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = timestamp;
      }

      const elapsed = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      let shouldStop = false;

      setCurrentTime((previous) => {
        const next = previous + (elapsed / 1000) * PLAYBACK_RATE;
        if (next >= timelineEnd) {
          shouldStop = true;
          return timelineEnd;
        }
        return next;
      });

      if (shouldStop) {
        setIsRunning(false);
        lastTickRef.current = null;
        return;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, timelineEnd]);

  function resetPlayback(nextParams?: ChaseParams) {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }
    lastTickRef.current = null;
    setIsRunning(false);
    setCurrentTime(0);
    if (nextParams) {
      setParams(nextParams);
    }
  }

  function updateParam(key: keyof ChaseParams, value: number) {
    resetPlayback({ ...params, [key]: value });
  }

  function handleStart() {
    if (timeAtEnd) {
      setCurrentTime(0);
    }
    setIsRunning(true);
  }

  let insightTitle = "正在追赶";
  let insightText = `三体飞船每分钟多追 ${relativeSpeed.toFixed(1)} km，现在还差 ${formatDistance(
    Math.max(current.remaining, 0)
  )}。`;

  if (!canCatch) {
    insightTitle = relativeSpeed === 0 ? "速度相同" : "追不上";
    insightText =
      relativeSpeed === 0
        ? `两船速度一样，间距会一直保持在 ${formatDistance(initialGap)}。`
        : `三体飞船每分钟会再落后 ${Math.abs(relativeSpeed).toFixed(
            1
          )} km，距离会越来越大。`;
  } else if (isCaught) {
    insightTitle = "已经追上";
    insightText = `在第 ${formatMinutes(catchTime)} 时追上，此时两船都飞到了 ${formatDistance(
      current.chaserDistance
    )}。`;
  }

  return (
    <main className="speed-lab">
      <div className="space-grid" />

      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">Light Math App</p>
          <h1>银河追击实验</h1>
          <p className="hero-copy__body">
            用“两艘宇宙飞船”的追赶故事，把路程问题一步步变成表格、图像和函数。学生先看见距离怎么变，再理解
            <b> 相对速度 </b>
            和
            <b> 剩余相距 </b>
            的关系。
          </p>
        </div>

        <div className="hero-math">
          <article>
            <span>初始相距</span>
            <strong>{formatDistance(initialGap)}</strong>
            <small>先出发时间 × 人类飞船速度</small>
          </article>
          <article>
            <span>相对速度</span>
            <strong>{relativeSpeed.toFixed(1)} km/分</strong>
            <small>三体速度 − 人类速度</small>
          </article>
          <article>
            <span>追上时间</span>
            <strong>{canCatch ? formatMinutes(catchTime) : "不会追上"}</strong>
            <small>初始相距 ÷ 相对速度</small>
          </article>
        </div>
      </section>

      <section className="control-panel">
        <div className="control-panel__header">
          <div>
            <p className="eyebrow">Scenario Setup</p>
            <h2>先设参数，再开始追赶</h2>
          </div>
          <div className="control-panel__actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleStart}
              disabled={isRunning}
            >
              <Play size={18} />
              {timeAtEnd ? "重新开始" : currentTime > 0 ? "继续追赶" : "开始追赶"}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setIsRunning(false)}
              disabled={!isRunning}
            >
              <Pause size={18} />
              暂停
            </button>
            <button type="button" className="ghost-button" onClick={() => resetPlayback()}>
              <RotateCcw size={18} />
              重置
            </button>
          </div>
        </div>

        <div className="preset-row">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="preset-chip"
              onClick={() => resetPlayback(preset.params)}
            >
              <strong>{preset.label}</strong>
              <span>{preset.note}</span>
            </button>
          ))}
        </div>

        <div className="control-grid">
          <ParameterSlider
            label="先出发时间"
            description="人类飞船先飞多久"
            min={1}
            max={12}
            step={1}
            value={params.leadTime}
            unit=" 分"
            onChange={(value) => updateParam("leadTime", value)}
          />
          <ParameterSlider
            label="人类飞船速度"
            description="前面的飞船每分钟飞多远"
            min={20}
            max={80}
            step={1}
            value={params.humanSpeed}
            unit=" km/分"
            onChange={(value) => updateParam("humanSpeed", value)}
          />
          <ParameterSlider
            label="三体飞船速度"
            description="后面的飞船每分钟飞多远"
            min={20}
            max={120}
            step={1}
            value={params.chaserSpeed}
            unit=" km/分"
            onChange={(value) => updateParam("chaserSpeed", value)}
          />
        </div>
      </section>

      <section className="stage-panel">
        <article className="stage-card">
          <div className="stage-card__header">
            <div>
              <p className="eyebrow">Demo Zone</p>
              <h2>演示区域：星空中的追赶</h2>
            </div>
            <div className="stage-card__time">
              <TimerReset size={18} />
              <strong>{formatMinutes(currentTime)}</strong>
            </div>
          </div>

          <div className="space-stage">
            <div className="space-stage__nebula space-stage__nebula--left" />
            <div className="space-stage__nebula space-stage__nebula--right" />
            {STARS.map((star) => (
              <i
                key={`${star.left}-${star.top}`}
                className="space-stage__star"
                style={
                  {
                    left: star.left,
                    top: star.top,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animationDelay: star.delay
                  } as CSSProperties
                }
              />
            ))}

            <div className="space-stage__track" />
            <div className="space-stage__track-label">追赶开始线</div>

            {gapProgress > 0 && !isCaught ? (
              <>
                <div
                  className="space-stage__gap-line"
                  style={{
                    left: toTrackPercent(chaserProgress),
                    width: `${gapProgress * trackSpan}%`
                  }}
                />
                <div
                  className="space-stage__gap-badge"
                  style={{
                    left: toTrackPercent(chaserProgress + gapProgress / 2)
                  }}
                >
                  还差 {formatDistance(current.remaining)}
                </div>
              </>
            ) : null}

            {isCaught ? (
              <div
                className="space-stage__catch-burst"
                style={{ left: toTrackPercent(chaserProgress) }}
              />
            ) : null}

            <div
              className="ship-token ship-token--human"
              style={{ left: toTrackPercent(humanProgress) }}
            >
              <ShipIcon variant="human" />
              <div className="ship-label">
                <strong>人类飞船</strong>
                <span>{formatDistance(current.humanDistance)}</span>
              </div>
            </div>

            <div
              className="ship-token ship-token--trisolaran"
              style={{ left: toTrackPercent(chaserProgress) }}
            >
              <ShipIcon variant="trisolaran" />
              <div className="ship-label">
                <strong>三体飞船</strong>
                <span>{formatDistance(current.chaserDistance)}</span>
              </div>
            </div>
          </div>
        </article>

        <aside className="insight-card">
          <div className="insight-card__headline">
            <Gauge size={18} />
            <span>实时解读</span>
          </div>
          <h3>{insightTitle}</h3>
          <p>{insightText}</p>

          <div className="insight-metrics">
            <article>
              <span>已追赶</span>
              <strong>{formatDistance(current.closed)}</strong>
            </article>
            <article>
              <span>剩余相距</span>
              <strong>{formatDistance(current.remaining)}</strong>
            </article>
            <article>
              <span>函数表达</span>
              <strong>剩余 = {initialGap.toFixed(0)} - {relativeSpeed.toFixed(0)}t</strong>
            </article>
          </div>

          <div className="formula-card">
            <div>
              <Orbit size={16} />
              <span>课堂提醒</span>
            </div>
            <p>让学生先猜“每分钟能追近多少”，再观察表格和曲线，会更容易形成函数直觉。</p>
          </div>
        </aside>
      </section>

      <section className="analysis-panel">
        <article className="analysis-card">
          <div className="analysis-card__header">
            <div>
              <p className="eyebrow">Analysis Zone</p>
              <h2>左侧表格：随着时间变化的数据</h2>
            </div>
          </div>

          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>t</th>
                  <th>距离减少（已追赶）</th>
                  <th>距离相距（剩余相距）</th>
                </tr>
              </thead>
              <tbody>
                {tableSamples.map((sample, index) => {
                  const isVisible = sample.time <= currentTime + 0.01;
                  const isCurrent = index === closestIndex;
                  return (
                    <tr
                      key={sample.time}
                      className={`${isVisible ? "row-visible" : "row-faded"} ${
                        isCurrent ? "row-current" : ""
                      }`}
                    >
                      <td>{sample.time} min</td>
                      <td>{formatDistance(sample.closed)}</td>
                      <td>{formatDistance(sample.remaining)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="analysis-card">
          <div className="analysis-card__header">
            <div>
              <p className="eyebrow">Function View</p>
              <h2>右侧曲线：路程问题变成函数图像</h2>
            </div>
          </div>
          <TrendChart samples={chartSamples} current={current} timelineEnd={timelineEnd} />
        </article>
      </section>
    </main>
  );
}
