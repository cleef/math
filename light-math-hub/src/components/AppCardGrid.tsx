import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { AppRecord } from "../data/types";
import Badge from "./Badge";
import AppIconBadge from "./AppIconBadge";
import { useI18n } from "../i18n/I18nProvider";

const getHue = (name: string) => {
  const seed = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return seed % 360;
};

export default function AppCardGrid({ apps }: { apps: AppRecord[] }) {
  const { catalog } = useI18n();
  const navigate = useNavigate();

  const handleLaunch = (appId: string) => {
    navigate(`/run/${appId}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, appId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLaunch(appId);
    }
  };

  const stopCardLaunch = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="card-grid">
      {apps.map((app) => {
        const hue = getHue(app.name);
        const style = { "--card-hue": hue } as CSSProperties;
        return (
          <article
            className="app-card"
            key={app.id}
            style={style}
            role="link"
            tabIndex={0}
            onClick={() => handleLaunch(app.id)}
            onKeyDown={(event) => handleCardKeyDown(event, app.id)}
          >
            <div className="app-card__media" aria-hidden="true">
              <AppIconBadge app={app} baseClassName="app-card__icon" />
            </div>
            <div className="app-card__content">
              <div className="app-card__title">{app.name}</div>
              <div className="app-card__desc">{app.description}</div>
              <div className="app-card__meta">
                {app.owner ? (
                  <span className="app-card__owner">{app.owner}</span>
                ) : (
                  <span className="app-card__owner">{catalog.appCard.defaultOwner}</span>
                )}
                {app.status ? <Badge label={app.status} /> : null}
              </div>
            </div>
            <div className="app-card__hover-actions">
              <Link
                to={`/app/${app.id}`}
                className="app-card__intro-btn"
                onClick={stopCardLaunch}
                onMouseDown={stopCardLaunch}
                onKeyDown={(event) => event.stopPropagation()}
              >
                {catalog.appCard.introButton}
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
