import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const highlights = [
  "覆盖同分母与异分母加减，贴合小学核心分数单元。",
  "学生提交后立即得到对错与标准答案，便于自查。",
  "教师可一键刷新题组，用于课堂分层练习与巩固。"
];

const teachingFlow = [
  "第 1 步：教师投屏示范 2 题，强调先通分再计算。",
  "第 2 步：学生独立完成 8 题并提交批改。",
  "第 3 步：按错题类型进行集中讲解和再次练习。"
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="spotlight-shell">
      <header className="hero">
        <p className="eyebrow">Lesson Spotlight</p>
        <h1>分数训练工坊</h1>
        <p className="subtitle">围绕“理解步骤 + 即时反馈”设计的课堂训练模块。</p>
      </header>

      <section className="spotlight-grid">
        <article className="panel">
          <h2>课程亮点</h2>
          <ul>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>建议教学流程</h2>
          <ul>
            {teachingFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel">
        <h2>适用场景</h2>
        <p>
          适用于小学数学分数单元的课堂练习、课后作业讲评、以及家长辅导场景。建议每次 8 题，
          5-8 分钟完成一轮，随后进行错题复盘。
        </p>
      </section>
    </main>
  </React.StrictMode>
);
