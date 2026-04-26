import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const highlights = [
  "在固定 1L 体积下，实时观察“密度升高 -> 质量增加”的直接对应关系。",
  "通过粒子数量变化把抽象公式转成可见过程，适合课堂讲解与学生自学。",
  "提供常见材料预设，便于比较木材、水、砂石、金属等物质差异。"
];

const classroomFlow = [
  "第 1 步：先让学生预测不同材料在 1L 下谁更重。",
  "第 2 步：拖动密度滑杆并使用预设，记录质量变化。",
  "第 3 步：回到公式 ρ = m / V，总结“体积固定时 m 与 ρ 成正比”。"
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <header className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Lesson Spotlight</p>
        <h1 className="mt-3 text-3xl font-bold">密度可视化实验</h1>
        <p className="mt-3 text-slate-600">
          通过固定体积容器中的动态可视化，帮助学生建立“密度、质量、体积”三者关系。
        </p>
      </header>

      <section className="mx-auto mt-6 grid max-w-4xl gap-6 md:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold">课程亮点</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold">建议教学流程</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
            {classroomFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  </React.StrictMode>
);
