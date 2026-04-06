import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function SpotlightPage() {
  return (
    <main className="spotlight-page">
      <section className="spotlight-hero">
        <p className="spotlight-hero__eyebrow">Allocation Expression Lab</p>
        <h1>为什么这节课先让孩子“看见 ideas”</h1>
        <p>
          许多学生把“空闲 12 个床位”写成 <code>10x + 12</code>，不是不会算，而是还没真正看见变化发生在哪一层。
          这个 app 借 Caucher Birkar 所强调的“数学是 ideas 的世界”来设计: 先观察、比较、提问，再把同一件事抽象成表达式。
        </p>
        <a className="spotlight-hero__link" href="./">
          返回主实验页
        </a>
      </section>

      <section className="spotlight-grid">
        <article>
          <h2>1. 先看变化，不先判对错</h2>
          <p>
            主页面先用具体数量演示两种分法，并允许暂停、继续、重置。孩子先看到空位、剩余、缺口、补出来的新组，而不是立刻进入答题压力。
          </p>
        </article>
        <article>
          <h2>2. 再问“变化落在哪一层”</h2>
          <p>
            app 把最关键的数学动作单独拿出来: 到底是在改总量，还是在改组数。学生先判断变化的位置，表达式才不容易写反。
          </p>
        </article>
        <article>
          <h2>3. 方程被呈现为“相遇”</h2>
          <p>
            当两个表达式在同一个 <code>x</code> 上说出同一个总量，学生看到的不是一条规定，而是两个 ideas 在同一点相遇。这种体验更接近发现，而不是背规则。
          </p>
        </article>
      </section>

      <section className="spotlight-tips">
        <h2>课堂使用建议</h2>
        <ul>
          <li>先把动画停在一半，让学生说“什么没变，什么变了”。</li>
          <li>进入表达式区后，先追问变化发生在总量还是组数，不急着求解。</li>
          <li>最后拖动 <code>x</code>，让学生自己观察两个表达式何时相遇、为何相遇。</li>
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
