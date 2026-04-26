import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const highlights = [
  "Turns cube surface area from formula memorization into visual reasoning through cuts and unfolding.",
  "Supports trial-and-error: learners can start with 3 cuts and iterate toward a valid full net.",
  "When the plan is valid, the app plays a verification unfold animation to strengthen spatial understanding.",
  "Adds a main-axis lens for the first six 1 + 4 + 1 cube nets, making the four-face belt and two caps visible."
];

const sections = [
  {
    title: "Module 1: Pick Edges",
    caption: "Select which of the 12 cube edges should be cut."
  },
  {
    title: "Module 2: Scissor Simulation",
    caption: "Play cut-by-cut animation to show the cutting process."
  },
  {
    title: "Module 3: Unfold Validation",
    caption: "Auto-verify and animate the final net when the cut plan is valid."
  },
  {
    title: "Module 4: Main Axis",
    caption: "Find the four-face belt inside a cube net and watch the remaining faces become caps."
  }
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="surface-lab">
      <header className="hero">
        <p className="hero__eyebrow">Lesson Spotlight</p>
        <h1>Cube Surface Area Lab</h1>
        <p className="hero__subtitle">Learners understand cube nets through interaction, validation, and animation.</p>
      </header>

      <section className="workspace workspace--spotlight">
        <article className="panel">
          <h2>Why It Works</h2>
          <ul className="spotlight-list">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Suggested Classroom Flow</h2>
          <p className="judge">Each round takes about 6-8 minutes: try, validate, then summarize the rule.</p>
          <div className="spotlight-grid">
            {sections.map((item) => (
              <article key={item.title} className="spotlight-card">
                <div className="spotlight-badge">Cube Lab</div>
                <h3>{item.title}</h3>
                <p>{item.caption}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  </React.StrictMode>
);
