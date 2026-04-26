import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const shooterRows = [
  {
    name: "红心校准员",
    combo: "低偏差 + 低方差",
    note: "平均落点靠近靶心，而且命中很集中。"
  },
  {
    name: "固执偏靶手",
    combo: "高偏差 + 低方差",
    note: "弹着点很集中，但整体偏在同一个错误位置。"
  },
  {
    name: "追风散弹客",
    combo: "低偏差 + 高方差",
    note: "平均位置还可以，单发命中却不稳定。"
  },
  {
    name: "迷航喷射王",
    combo: "高偏差 + 高方差",
    note: "既偏离中心，又分布松散。"
  }
];

const classroomFlow = [
  "先预测：四类枪手谁最适合拿来说明“只改准度，不改稳定性”？",
  "再实操：选中一种枪手，连续点击靶纸打满 10 发。",
  "最后对比：观察平均落点与散布范围，区分 Bias 和 Variance。"
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="range-app">
      <div className="range-app__backdrop" />
      <section className="hero-card" style={{ maxWidth: 1180 }}>
        <div>
          <p className="eyebrow">Lesson Spotlight</p>
          <h1>偏差与方差打靶实验</h1>
          <p className="hero-copy">
            用同一个“瞄准靶心”的故事，把机器学习里常见的 Bias / Variance
            概念变成学生能一眼看懂的靶面分布。
          </p>
        </div>

        <div className="hero-metrics">
          <article>
            <span>课堂目标</span>
            <strong>区分“偏离中心”和“分布松散”</strong>
            <small>平均落点看偏差，离散程度看方差。</small>
          </article>
          <article>
            <span>互动方式</span>
            <strong>选枪手 + 连开 10 枪</strong>
            <small>每轮自动生成一张新的散点分布图。</small>
          </article>
        </div>
      </section>

      <section className="stage-grid" style={{ maxWidth: 1180 }}>
        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Shooter Set</p>
              <h2>四类枪手</h2>
            </div>
          </div>

          <div className="insight-stack">
            {shooterRows.map((row) => (
              <article key={row.name} className="insight-card">
                <span>{row.combo}</span>
                <strong>{row.name}</strong>
                <p>{row.note}</p>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Classroom Flow</p>
              <h2>建议教学流程</h2>
            </div>
          </div>

          <div className="insight-stack">
            {classroomFlow.map((item) => (
              <article key={item} className="lesson-card">
                <span>Teaching Tip</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  </React.StrictMode>
);
