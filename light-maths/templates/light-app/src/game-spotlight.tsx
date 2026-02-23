import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const highlights = [
  "一句话说明课程目标，让教师和学生 5 秒理解价值。",
  "列出核心能力点，例如分数运算、几何观察、逻辑推理。",
  "展示课堂流程或学习路径，降低上手成本。"
];

const sections = [
  {
    title: "模块 1：导入",
    caption: "用 1-2 个例子建立直觉。"
  },
  {
    title: "模块 2：练习",
    caption: "设置循序渐进的训练任务。"
  },
  {
    title: "模块 3：反馈",
    caption: "给出结果解释与错因提示。"
  }
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="app app--spotlight">
      <header className="app__header">
        <div className="app__eyebrow">Lesson Spotlight</div>
        <h1>你的课程名</h1>
        <p className="app__subtitle">一句吸引用户点击“开始学习”的价值主张。</p>
      </header>

      <section className="app__panel">
        <h2>为什么有用</h2>
        <ul className="app__list">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="app__panel">
        <h2>课程结构</h2>
        <p className="app__caption">将以下占位卡替换为你的真实教学模块内容。</p>
        <div className="shot-grid">
          {sections.map((item) => (
            <article key={item.title} className="shot-card">
              <div className="shot-placeholder">Module</div>
              <h3>{item.title}</h3>
              <p>{item.caption}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  </React.StrictMode>
);
