import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { AppRecord } from "../data/types";
import Badge from "./Badge";
import AppIconBadge from "./AppIconBadge";

const getHue = (name: string) => {
  const seed = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return seed % 360;
};

export default function AppCardGrid({ apps }: { apps: AppRecord[] }) {
  return (
    <div className="card-grid">
      {apps.map((app) => {
        const hue = getHue(app.name);
        const style = { "--card-hue": hue } as CSSProperties;
        return (
          <Link to={`/app/${app.id}`} className="app-card" key={app.id} style={style}>
            <div className="app-card__media">
              <div className="app-card__image" aria-hidden="true">
                <div className="app-card__image-glow" />
                <AppIconBadge app={app} baseClassName="app-card__image-mark" />
              </div>
            </div>
            <div className="app-card__content">
              <div className="app-card__title">{app.name}</div>
              <div className="app-card__desc">{app.description}</div>
              <div className="app-card__meta">
                {app.owner ? (
                  <span className="app-card__owner">{app.owner}</span>
                ) : (
                  <span className="app-card__owner">Math Team</span>
                )}
                {app.status ? <Badge label={app.status} /> : null}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
