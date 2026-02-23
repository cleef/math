import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="app">
      <header className="app__header">
        <div className="app__eyebrow">Math App Template</div>
        <h1>课程名称</h1>
        <p className="app__subtitle">在这里实现你的数学教学活动、练习或可视化模块。</p>
      </header>
      <section className="app__panel">
        <p>从编辑 <code>src/main.tsx</code> 开始。</p>
        <button type="button">主操作按钮</button>
      </section>
    </main>
  </React.StrictMode>
);
