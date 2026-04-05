import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function SpotlightPage() {
  return (
    <main className="spotlight-page">
      <section className="spotlight-hero">
        <p className="spotlight-hero__eyebrow">Allocation Expression Lab</p>
        <h1>为什么这节课先演示，再列式</h1>
        <p>
          很多学生会把“空闲 12 个床位”写成 <code>10x + 12</code>，不是不会算，而是还没把题意翻译成数量关系。
          这个 app 先把分配过程演给学生看，再把同一过程抽象成含未知数的表达式。
        </p>
        <a className="spotlight-hero__link" href="./">
          返回主实验页
        </a>
      </section>

      <section className="spotlight-grid">
        <article>
          <h2>1. 先看见“发生了什么”</h2>
          <p>
            用具体数量演示两种分法，并提供开始、暂停、重置。学生先看到哪些是空位、哪些是剩余、哪些是需要补上的新组。
          </p>
        </article>
        <article>
          <h2>2. 再问“该把变化写在哪里”</h2>
          <p>
            第二步不是直接让学生整式输入，而是只聚焦最容易写反的符号方向：调整总量，还是调整组数；应该加，还是应该减。
          </p>
        </article>
        <article>
          <h2>3. 用 AI 拓展新题型</h2>
          <p>
            除了内置的房间和苹果，教师还可以让 AI 生成“分书本”“分桌椅”“分小船”等同结构新场景，继续练习同一种数学表达。
          </p>
        </article>
      </section>

      <section className="spotlight-tips">
        <h2>课堂使用建议</h2>
        <ul>
          <li>先暂停在动画中间，让学生口头说“这里多了什么、少了什么”。</li>
          <li>再切到抽象区，让学生只判断符号，不急着解方程。</li>
          <li>最后拖动试代滑杆，看两个表达式什么时候真的表示同一个总量。</li>
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
