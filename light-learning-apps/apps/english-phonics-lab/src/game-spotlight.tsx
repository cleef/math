import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const modules = [
  {
    title: "Sound",
    caption: "Hear the phoneme and notice how the sound moves."
  },
  {
    title: "Mouth",
    caption: "Observe lip shape, tongue height, and jaw movement."
  },
  {
    title: "Pattern",
    caption: "Connect the sound to spelling patterns and example words."
  },
  {
    title: "Contrast",
    caption: "Compare nearby sounds so learners can hear the difference."
  }
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="phonics-app phonics-app--spotlight">
      <section className="phonics-hero">
        <div className="phonics-hero__copy">
          <div className="eyebrow">Lesson Spotlight</div>
          <h1>English Phonics Lab</h1>
          <p>Phoneme cards turn sound, mouth shape, spelling, and contrast into one repeatable routine.</p>
        </div>
        <div className="sound-orb" aria-label="phonics">
          Aa
        </div>
      </section>

      <section className="spotlight-grid">
        {modules.map((module) => (
          <article className="spotlight-card" key={module.title}>
            <h2>{module.title}</h2>
            <p>{module.caption}</p>
          </article>
        ))}
      </section>
    </main>
  </React.StrictMode>
);
