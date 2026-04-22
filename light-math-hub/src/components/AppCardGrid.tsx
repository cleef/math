import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { AppRecord } from "../data/types";
import AppIconBadge from "./AppIconBadge";
import { useI18n } from "../i18n/I18nProvider";

const getHue = (name: string) => {
  const seed = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return seed % 360;
};

export default function AppCardGrid({ apps }: { apps: AppRecord[] }) {
  const { catalog } = useI18n();

  const openApp = (appId: string) => {
    window.open(`/run/${appId}`, "_blank", "noopener,noreferrer");
  };

  const handleCardClick = (event: MouseEvent<HTMLElement>, appId: string) => {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) {
      return;
    }
    openApp(appId);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, appId: string) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    openApp(appId);
  };

  const stopCardLaunch = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="card-grid">
      {apps.map((app, index) => {
        const hue = getHue(app.name);
        const style = { "--card-hue": hue, "--card-index": index } as CSSProperties;
        return (
          <article
            className="app-card"
            key={app.id}
            style={style}
            role="link"
            tabIndex={0}
            aria-label={`Enter ${app.name}`}
            onClick={(event) => handleCardClick(event, app.id)}
            onKeyDown={(event) => handleCardKeyDown(event, app.id)}
          >
            <div className="app-card__media" aria-hidden="true">
              <AppIconBadge app={app} baseClassName="app-card__icon" />
            </div>
            <div className="app-card__content">
              <div className="app-card__eyebrow">{app.owner ?? catalog.appCard.defaultOwner}</div>
              <div className="app-card__title">{app.name}</div>
              <div className="app-card__desc">{app.description}</div>
              <div className="app-card__footer">
                <Link
                  to={`/app/${app.id}`}
                  className="app-card__detail-link"
                  onClick={stopCardLaunch}
                  onMouseDown={stopCardLaunch}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {catalog.appCard.introButton}
                </Link>
                <button
                  type="button"
                  className="btn btn-primary btn-small app-card__open-btn"
                  onClick={(event) => {
                    stopCardLaunch(event);
                    openApp(app.id);
                  }}
                >
                  {catalog.appCard.openButton}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
