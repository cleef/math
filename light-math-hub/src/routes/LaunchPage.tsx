import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { currentUser } from "../data/currentUser";
import { findAppById, hasAccess, isListed } from "../data/appAccess";
import AccessDeniedPage from "./AccessDeniedPage";
import NotFoundPage from "./NotFoundPage";

export default function LaunchPage() {
  const { id } = useParams();

  if (!id) {
    return <NotFoundPage />;
  }

  const app = findAppById(id);

  if (!app || !app.enabled || !isListed(app)) {
    return <NotFoundPage />;
  }

  if (!hasAccess(app, currentUser.permissions)) {
    return <AccessDeniedPage />;
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.assign(app.entryPath);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [app.entryPath]);

  return (
    <div className="fullscreen">
      <div className="loading-card">
        <div className="spinner" aria-hidden="true" />
        <div>
          <div className="loading-title">正在进入 {app.name}</div>
          <div className="loading-subtitle">课程资源加载中...</div>
        </div>
      </div>
    </div>
  );
}
