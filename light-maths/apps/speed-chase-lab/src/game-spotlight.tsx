import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const highlights = [
  "把“追及问题”拆成星空动画、数据表和函数曲线三个视角，帮助学生从情境走向抽象。",
  "支持调节先出发时间与两艘飞船速度，适合讲“相对速度”与“剩余距离”的变化规律。",
  "既能展示标准课本情境，也能切换到“追不上”的反例，让学生比较不同函数图像。 "
];

const classroomFlow = [
  "第 1 步：先让学生猜一猜，三体飞船每分钟能追近多少千米。",
  "第 2 步：点击“开始追赶”，观察表格和曲线如何同时更新。",
  "第 3 步：用公式 剩余距离 = 初始距离 - 相对速度 × t，总结图像意义。"
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="min-h-screen px-6 py-8 text-slate-100 md:px-10">
      <header className="mx-auto max-w-5xl rounded-[28px] border border-sky-200/15 bg-slate-950/55 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Lesson Spotlight</p>
        <h1 className="mt-3 text-3xl font-bold md:text-5xl">银河追击实验</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          这是一个适合小学高年级课堂投屏的追及问题应用。它把“谁先出发、谁更快、多久追上”这些语言，直接变成能看见的运动和函数。
        </p>
      </header>

      <section className="mx-auto mt-6 grid max-w-5xl gap-6 md:grid-cols-2">
        <article className="rounded-[28px] border border-sky-200/15 bg-slate-950/55 p-6 shadow-xl shadow-slate-950/35 backdrop-blur">
          <h2 className="text-xl font-semibold">课程亮点</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-300">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-[28px] border border-sky-200/15 bg-slate-950/55 p-6 shadow-xl shadow-slate-950/35 backdrop-blur">
          <h2 className="text-xl font-semibold">建议教学流程</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-slate-300">
            {classroomFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  </React.StrictMode>
);
