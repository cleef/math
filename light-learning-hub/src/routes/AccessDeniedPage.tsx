import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";

export default function AccessDeniedPage() {
  const { catalog } = useI18n();

  return (
    <div className="fullscreen">
      <div className="state-card">
        <div className="state-title">{catalog.statePages.accessDeniedTitle}</div>
        <p>{catalog.statePages.accessDeniedDescription}</p>
        <Link to="/" className="btn btn-secondary">
          {catalog.statePages.backHome}
        </Link>
      </div>
    </div>
  );
}
