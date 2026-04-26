import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  MAX_SHOTS,
  describeBias,
  describeVariance,
  formatLayerDistance,
  shooters,
  simulateShots,
  summarizeShots
} from "./shootingModel";

const seeds = {
  "centered-captain": 101,
  "stubborn-sniper": 202,
  "stormy-ranger": 303,
  "lost-drifter": 404
} as const;

function ComparePage() {
  return (
    <main className="range-app">
      <div className="range-app__backdrop" />
      <section className="compare-shell">
        <div className="compare-shell__topbar">
          <div>
            <p className="eyebrow">Compare Mode</p>
            <h1>四类枪手分布总览</h1>
          </div>
          <a className="ghost-button ghost-button--link" href="./">
            返回主页
          </a>
        </div>

        <div className="compare-grid">
          {shooters.map((shooter) => {
            const shots = simulateShots(shooter, MAX_SHOTS, seeds[shooter.id as keyof typeof seeds]);
            const { meanX, meanY, biasDistance, spread } = summarizeShots(shots);

            return (
              <article
                key={shooter.id}
                className="compare-card"
                style={
                  {
                    "--accent": shooter.accent,
                    "--glow": shooter.glow
                  } as React.CSSProperties
                }
              >
                <div className="compare-card__head">
                  <span>{shooter.combo}</span>
                  <strong>{shooter.name}</strong>
                </div>

                <div className="compare-target">
                  <svg viewBox="-220 -220 440 440" role="img" aria-hidden="true">
                    <circle r="205" fill="rgba(255,255,255,0.42)" />
                    <circle r="180" fill="#f7f1dc" stroke="#a46528" strokeWidth="5" />
                    <circle r="135" fill="#df9c4b" stroke="#f7f1dc" strokeWidth="3" />
                    <circle r="90" fill="#f7f1dc" stroke="#df9c4b" strokeWidth="3" />
                    <circle r="45" fill="#d7443e" stroke="#f7f1dc" strokeWidth="3" />
                    <circle r="18" fill="#7a0f13" stroke="#f7f1dc" strokeWidth="2.5" />
                    <line x1="-190" y1="0" x2="190" y2="0" stroke="rgba(72, 43, 19, 0.28)" strokeWidth="2" />
                    <line x1="0" y1="-190" x2="0" y2="190" stroke="rgba(72, 43, 19, 0.28)" strokeWidth="2" />

                    {shots.map((shot) => (
                      <g key={`${shooter.id}-${shot.id}`}>
                        <circle cx={shot.x} cy={shot.y} r="9" fill={shooter.accent} />
                        <circle
                          cx={shot.x}
                          cy={shot.y}
                          r="18"
                          fill="none"
                          stroke={shooter.accent}
                          strokeOpacity="0.28"
                          strokeWidth="2"
                        />
                      </g>
                    ))}

                    <g>
                      <circle cx={meanX} cy={meanY} r="13" fill="none" stroke="#0f172a" strokeWidth="3" />
                      <line x1={meanX - 10} y1={meanY} x2={meanX + 10} y2={meanY} stroke="#0f172a" strokeWidth="3" />
                      <line x1={meanX} y1={meanY - 10} x2={meanX} y2={meanY + 10} stroke="#0f172a" strokeWidth="3" />
                    </g>
                  </svg>
                </div>

                <div className="compare-stats">
                  <div>
                    <span>平均偏移</span>
                    <strong>{formatLayerDistance(biasDistance)}</strong>
                    <small>{describeBias(biasDistance)}</small>
                  </div>
                  <div>
                    <span>离散圈层</span>
                    <strong>{formatLayerDistance(spread)}</strong>
                    <small>{describeVariance(spread)}</small>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ComparePage />
  </React.StrictMode>
);
