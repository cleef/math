import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function SpotlightPage() {
  return (
    <main className="spotlight-page">
      <section className="spotlight-panel">
        <h1>圆与 π 逼近实验</h1>
        <p>
          这个课程页把“逼近”拆成两个连续体验：先看形状如何逼近圆，再看数值如何逼近真实计算。重点不是公式堆叠，而是让学生直接看见变化。
        </p>
        <a className="spotlight-link" href="./">
          返回主实验页
        </a>
      </section>

      <section className="spotlight-panel">
        <h2>模块 1：多边形逼近圆</h2>
        <ul>
          <li>边数滑杆支持 3 到 200，实时刷新图形与误差。</li>
          <li>支持播放、暂停、重置，形成连续逼近过程。</li>
          <li>可切换内接和内外双显示，直观看到“夹逼”关系。</li>
        </ul>
      </section>

      <section className="spotlight-panel">
        <h2>模块 2：π 近似误差</h2>
        <ul>
          <li>可改半径与 π 取值，比较真实值和近似值。</li>
          <li>同时展示周长、面积、绝对误差、相对误差。</li>
          <li>用长度条辅助表达“近似可用但并非精确”的认知。</li>
        </ul>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SpotlightPage />
  </React.StrictMode>
);
