import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { currentUser } from "../data/currentUser";
import { findAppById, hasAccess, isListed } from "../data/appAccess";
import AccessDeniedPage from "./AccessDeniedPage";
import NotFoundPage from "./NotFoundPage";
import { useI18n } from "../i18n/I18nProvider";
import { localizeAppRecord } from "../i18n/localizeAppRecord";

export default function LaunchPage() {
  const { locale, catalog } = useI18n();
  const { id } = useParams();

  if (!id) {
    return <NotFoundPage />;
  }

  const sourceApp = findAppById(id);

  if (!sourceApp || !sourceApp.enabled || !isListed(sourceApp)) {
    return <NotFoundPage />;
  }

  if (!hasAccess(sourceApp, currentUser.permissions)) {
    return <AccessDeniedPage />;
  }

  const app = localizeAppRecord(sourceApp, locale);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.assign(sourceApp.entryPath);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [sourceApp.entryPath]);

  return (
    <div className="fullscreen">
      <div className="loading-card">
        <div className="spinner" aria-hidden="true" />
        <div>
          <div className="loading-title">{catalog.launch.loadingTitle(app.name)}</div>
          <div className="loading-subtitle">{catalog.launch.loadingSubtitle}</div>
        </div>
      </div>
    </div>
  );
}
