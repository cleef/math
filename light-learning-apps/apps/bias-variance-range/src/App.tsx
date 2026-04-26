import { useState, type CSSProperties } from "react";
import {
  MAX_SHOTS,
  createShot,
  describeBias,
  describeVariance,
  formatLayerDistance,
  formatRingScore,
  shooters,
  summarizeShots,
  type Shot
} from "./shootingModel";

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);

  const selectedShooter =
    shooters.find((shooter) => shooter.id === selectedId) ?? null;

  const { meanX, meanY, biasDistance, spread, averageScore } = summarizeShots(shots);
  const remainingShots = MAX_SHOTS - shots.length;
  const lastShot = shots[shots.length - 1];
  const isRevealReady = shots.length === MAX_SHOTS;
  const reticleX = lastShot?.x ?? 0;
  const reticleY = lastShot?.y ?? 0;

  function resetShots(nextShooterId = selectedShooter?.id ?? null) {
    setSelectedId(nextShooterId);
    setShots([]);
  }

  function handleSelectShooter(shooterId: string) {
    resetShots(shooterId);
  }

  function handleShoot() {
    if (!selectedShooter || shots.length >= MAX_SHOTS) {
      return;
    }

    const newShot = createShot(selectedShooter, shots.length + 1, shots);
    setShots((currentShots) => [...currentShots, newShot]);
  }

  return (
    <main className="range-app">
      <div className="range-app__backdrop" />
      {!selectedShooter ? (
        <section className="selection-screen">
          <a className="compare-link" href="./compare.html">
            查看四类分布
          </a>

          <div className="selection-grid selection-grid--single">
            {shooters.map((shooter) => (
              <button
                key={shooter.id}
                type="button"
                className="shooter-card"
                style={
                  {
                    "--accent": shooter.accent,
                    "--glow": shooter.glow
                  } as CSSProperties
                }
                onClick={() => handleSelectShooter(shooter.id)}
              >
                <strong>{shooter.name}</strong>
                <p>{shooter.teaser}</p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="stage-shell">
          <div className="stage-shell__topbar">
            <div className="stage-shell__status">
              <span>当前枪手</span>
              <strong>{selectedShooter.name}</strong>
              <small>
                {remainingShots > 0 ? `第 ${shots.length + 1} 发准备中` : "10 发已完成"}
              </small>
            </div>
            <div className="stage-shell__actions">
              <button type="button" className="ghost-button" onClick={() => resetShots(null)}>
                重新选枪手
              </button>
              <button type="button" className="ghost-button" onClick={() => resetShots()}>
                重置靶纸
              </button>
            </div>
          </div>

          <div className="stage-grid">
            <article className="panel target-panel">
              <div className="panel__header">
                <div>
                  <h2>点击靶纸开火</h2>
                </div>
              </div>

              <p className="panel__hint">
                所有枪手都在瞄准中心圆点。你每点击一次，就记录一发真实落点；切换枪手会自动清空这一轮。
              </p>

              <button
                type="button"
                className={`target-board${shots.length >= MAX_SHOTS ? " target-board--locked" : ""}`}
                onClick={handleShoot}
                aria-label="点击靶纸开火"
                disabled={shots.length >= MAX_SHOTS}
              >
                <svg viewBox="-220 -220 440 440" role="img" aria-hidden="true">
                  <defs>
                    <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                    </radialGradient>
                  </defs>

                  <circle r="205" fill="url(#targetGlow)" opacity="0.8" />
                  <circle r="180" fill="#f7f1dc" stroke="#a46528" strokeWidth="5" />
                  <circle r="135" fill="#df9c4b" stroke="#f7f1dc" strokeWidth="3" />
                  <circle r="90" fill="#f7f1dc" stroke="#df9c4b" strokeWidth="3" />
                  <circle r="45" fill="#d7443e" stroke="#f7f1dc" strokeWidth="3" />
                  <circle r="18" fill="#7a0f13" stroke="#f7f1dc" strokeWidth="2.5" />
                  <line x1="-190" y1="0" x2="190" y2="0" stroke="rgba(72, 43, 19, 0.28)" strokeWidth="2" />
                  <line x1="0" y1="-190" x2="0" y2="190" stroke="rgba(72, 43, 19, 0.28)" strokeWidth="2" />

                  {shots.map((shot, index) => (
                    <g key={shot.id} className="shot-mark">
                      <circle
                        cx={shot.x}
                        cy={shot.y}
                        r="9"
                        fill={selectedShooter.accent}
                        opacity={index === shots.length - 1 ? "1" : "0.82"}
                      />
                      <circle
                        cx={shot.x}
                        cy={shot.y}
                        r="18"
                        fill="none"
                        stroke={selectedShooter.accent}
                        strokeOpacity="0.32"
                        strokeWidth="2"
                      />
                      <text
                        x={shot.x + 11}
                        y={shot.y - 11}
                        fontSize="14"
                        fontWeight="700"
                        fill="#f8fafc"
                      >
                        {shot.id}
                      </text>
                    </g>
                  ))}

                  <g className="reticle-mark">
                    <circle
                      cx={reticleX}
                      cy={reticleY}
                      r="15"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="3"
                    />
                    <circle
                      cx={reticleX}
                      cy={reticleY}
                      r="24"
                      fill="none"
                      stroke="rgba(15, 23, 42, 0.26)"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                    />
                    <line
                      x1={reticleX - 12}
                      y1={reticleY}
                      x2={reticleX + 12}
                      y2={reticleY}
                      stroke="#0f172a"
                      strokeWidth="3"
                    />
                    <line
                      x1={reticleX}
                      y1={reticleY - 12}
                      x2={reticleX}
                      y2={reticleY + 12}
                      stroke="#0f172a"
                      strokeWidth="3"
                    />
                  </g>
                </svg>

                <div className="target-board__badge">
                  {shots.length < MAX_SHOTS ? "点击继续开火" : "10 发已完成"}
                </div>
              </button>

              <div className="target-panel__footer">
                <div>
                  <span>黑色十字</span>
                  <strong>最新一枪准心</strong>
                </div>
                <div>
                  <span>彩色圆点</span>
                  <strong>每一发真实命中</strong>
                </div>
                <div>
                  <span>当前解读</span>
                  <strong>
                    {isRevealReady
                      ? `${describeBias(biasDistance)} / ${describeVariance(spread)}`
                      : "10 发后揭晓"}
                  </strong>
                </div>
              </div>
            </article>

            <article className="panel insight-panel">
              <div className="panel__header">
                <div>
                  <p className="eyebrow">Reading Panel</p>
                  <h2>结果解读</h2>
                </div>
              </div>

              <div className="insight-stack">
                <article className="insight-card">
                  <span>{isRevealReady ? "理论组合" : "结果状态"}</span>
                  <strong>{isRevealReady ? selectedShooter.combo : "请先完成 10 发射击"}</strong>
                  <p>
                    {isRevealReady
                      ? selectedShooter.reveal
                      : "先观察落点分布，再判断它更像哪一种组合。"}
                  </p>
                </article>

                <article className="stats-grid">
                  <div>
                    <span>平均偏移</span>
                    <strong>{formatLayerDistance(biasDistance)}</strong>
                    <small>{isRevealReady ? describeBias(biasDistance) : "按靶面圈层显示，不再使用 px"}</small>
                  </div>
                  <div>
                    <span>离散圈层</span>
                    <strong>{formatLayerDistance(spread)}</strong>
                    <small>{isRevealReady ? describeVariance(spread) : "看这一团落点散开了多少圈"}</small>
                  </div>
                  <div>
                    <span>平均环数</span>
                    <strong>{averageScore.toFixed(1)}</strong>
                    <small>10 分制近似读数</small>
                  </div>
                  <div>
                    <span>最新一枪</span>
                    <strong>{lastShot ? formatRingScore(lastShot.distanceToCenter) : "--"}</strong>
                    <small>
                      {lastShot
                        ? `第 ${lastShot.id} 发 · 偏离 ${formatLayerDistance(lastShot.distanceToCenter)}`
                        : "等待开火"}
                    </small>
                  </div>
                </article>

                <article className="distribution-card">
                  <div className="distribution-card__head">
                    <span>分布坐标图</span>
                    <strong>围绕原点看散布</strong>
                  </div>

                  <svg viewBox="-120 -120 240 240" aria-hidden="true">
                    <rect x="-110" y="-110" width="220" height="220" rx="24" fill="rgba(148, 163, 184, 0.08)" />
                    <line x1="-100" y1="0" x2="100" y2="0" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="2" />
                    <line x1="0" y1="-100" x2="0" y2="100" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="2" />
                    <circle r="56" fill="none" stroke="rgba(148, 163, 184, 0.22)" strokeWidth="2" strokeDasharray="6 8" />
                    {shots.map((shot) => (
                      <circle
                        key={`mini-${shot.id}`}
                        cx={shot.x / 2}
                        cy={shot.y / 2}
                        r="5.5"
                        fill={selectedShooter.accent}
                      />
                    ))}
                    {shots.length > 0 && (
                      <g>
                        <circle cx={meanX / 2} cy={meanY / 2} r="8" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2.5" />
                        <line
                          x1={meanX / 2 - 7}
                          y1={meanY / 2}
                          x2={meanX / 2 + 7}
                          y2={meanY / 2}
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                        <line
                          x1={meanX / 2}
                          y1={meanY / 2 - 7}
                          x2={meanX / 2}
                          y2={meanY / 2 + 7}
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                      </g>
                    )}
                  </svg>
                </article>

                <article className="lesson-card">
                  <span>教学提示</span>
                  <p>
                    Bias 关注的是整团落点离靶心有多远；Variance
                    关注的是这团落点彼此之间有多分散。即使平均位置正确，只要散得太开，方差仍然会很高。
                  </p>
                </article>
              </div>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}
