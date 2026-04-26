import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { currentUser } from "../data/currentUser";
import { getVisibleAppsBySubject } from "../data/appAccess";
import { enabledSubjects } from "../data/subjects";
import type { SubjectId } from "../data/types";
import { useI18n } from "../i18n/I18nProvider";

function SubjectMark({ subjectId }: { subjectId: SubjectId }) {
  if (subjectId === "english") {
    return (
      <span className="subject-card__mark subject-card__mark--english" aria-hidden="true">
        <span className="language-wave language-wave--one" />
        <span className="language-wave language-wave--two" />
        <span className="language-wave language-wave--three" />
        <span className="language-curve" />
        <span className="language-dot" />
      </span>
    );
  }

  return (
    <span className="subject-card__mark subject-card__mark--math" aria-hidden="true">
      <span className="math-orbit" />
      <span className="math-line math-line--primary" />
      <span className="math-line math-line--secondary" />
      <span className="math-node math-node--one" />
      <span className="math-node math-node--two" />
      <span className="math-node math-node--three" />
    </span>
  );
}

export default function HomePage() {
  const { locale, catalog } = useI18n();
  const homeText = catalog.home;

  return (
    <section className="home-shell" aria-labelledby="home-title">
      <div className="home-hero">
        <h1 id="home-title">{homeText.title}</h1>
      </div>

      <nav className="subject-grid" aria-label={homeText.subjectNavAriaLabel}>
        {enabledSubjects.map((subject, index) => {
          const count = getVisibleAppsBySubject(subject.id, currentUser.permissions).length;
          return (
            <Link
              className="subject-card"
              to={`/${subject.id}`}
              key={subject.id}
              style={{ "--subject-index": index } as CSSProperties}
            >
              <SubjectMark subjectId={subject.id} />
              <span className="subject-card__body">
                <span className="subject-card__name">{subject.name[locale]}</span>
                <span className="subject-card__desc">{subject.description[locale]}</span>
              </span>
              <span className="subject-card__count">
                {homeText.courseCount(count)}
              </span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
