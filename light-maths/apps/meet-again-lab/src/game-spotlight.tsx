import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const highlights = [
  "动态轨道动画直观展示两人相向而行、折返全过程，从具体情境走向抽象图像。",
  "位置–时间折线图实时绘制，学生能看到两条折线为何在 t=4 和 t=12 处相交。",
  "提供「合计路程法」和「分段追踪法」两种解法推导，适合不同层次学生理解。"
];

const classroomFlow = [
  "第 1 步：先让学生猜第二次相遇大约在几分钟后，建立直觉。",
  "第 2 步：点击「播放」，观察两人运动轨迹和位置–时间图同步变化。",
  "第 3 步：暂停在折返点，讨论此时两人各在哪里、下一步怎么走。",
  "第 4 步：展示解法推导，引导学生理解「第 n 次相遇合计路程 = (2n−1)×全程」的规律。"
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="min-h-screen px-6 py-8" style={{ background: "#FAFAF7", color: "#1C1917" }}>
      <header style={{
        maxWidth: 800, margin: "0 auto 24px",
        padding: 32, borderRadius: 20,
        background: "white", border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.07)"
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(28,25,23,0.5)", marginBottom: 8 }}>
          Lesson Spotlight
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px", background: "linear-gradient(135deg,#F97316,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          折返相遇实验
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(28,25,23,0.6)", margin: 0 }}>
          通过动态折返动画和位置–时间图，帮学生看懂「第二次相遇」背后的路程逻辑。适合小学高年级行程问题教学。
        </p>
      </header>

      <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <article style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>课程亮点</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {highlights.map((h, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.6 }}>
                <span style={{ color: "#F97316", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {h}
              </li>
            ))}
          </ul>
        </article>

        <article style={{ background: "white", borderRadius: 16, padding: 24, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>课堂使用流程</h2>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {classroomFlow.map((step, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.6 }}>
                <span style={{ background: "#0EA5E9", color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </article>

        <article style={{ background: "rgba(254,243,199,0.4)", borderRadius: 16, padding: 24, border: "1px solid rgba(245,158,11,0.35)", gridColumn: "1 / -1", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>核心数学结论</h2>
          <p style={{ fontSize: 13, lineHeight: 1.75, margin: 0, color: "rgba(28,25,23,0.75)" }}>
            两人在长为 L 的路段上相向折返行走，速度分别为 v₁、v₂。
            第 <strong>n</strong> 次相遇时，两人合计行走路程为 <strong>(2n−1)×L</strong>。
            本题：L=600 m，v₁+v₂=150 m/分，第 2 次相遇 → 合计路程 1800 m → 时间 = 1800÷150 = <strong>12 分钟</strong>，位置距小强起点 <strong>240 m</strong>。
          </p>
        </article>
      </div>
    </main>
  </React.StrictMode>
);
