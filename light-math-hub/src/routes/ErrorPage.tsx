import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";

export default function ErrorPage() {
  const { catalog } = useI18n();

  return (
    <div className="fullscreen">
      <div className="state-card">
        <div className="state-title">{catalog.statePages.loadErrorTitle}</div>
        <p>{catalog.statePages.loadErrorDescription}</p>
        <div className="state-actions">
          <Link to="/" className="btn btn-secondary">
            {catalog.statePages.backHome}
          </Link>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            {catalog.statePages.reload}
          </button>
        </div>
      </div>
    </div>
  );
}
