import { Link, NavLink } from "react-router-dom";
import { enabledSubjects } from "../data/subjects";
import { useI18n } from "../i18n/I18nProvider";
import type { Locale } from "../i18n/types";

type TopNavProps = {
  locale: Locale;
};

export default function TopNav({ locale }: TopNavProps) {
  const { catalog } = useI18n();
  const topNavText = catalog.topNav;

  return (
    <header className="top-nav">
      <Link to="/" className="top-nav__brand" aria-label={topNavText.homeAriaLabel}>
        <span className="brand-symbol" aria-hidden="true">
          <span className="brand-symbol__stem" />
          <span className="brand-symbol__beam" />
          <span className="brand-symbol__dot" />
        </span>
        <span className="brand-wordmark">Light Learning</span>
      </Link>
      <nav className="top-nav__subjects" aria-label={topNavText.subjectNavAriaLabel}>
        {enabledSubjects.map((subject) => (
          <NavLink
            key={subject.id}
            to={`/${subject.id}`}
            className={({ isActive }) =>
              `subject-nav-link ${isActive ? "subject-nav-link--active" : ""}`
            }
          >
            {subject.name[locale]}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
