import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { currentUser } from "../data/currentUser";
import { findAppById, hasAccess, isListed } from "../data/appAccess";
import AccessDeniedPage from "./AccessDeniedPage";
import NotFoundPage from "./NotFoundPage";
import AppIconBadge from "../components/AppIconBadge";
import { useI18n } from "../i18n/I18nProvider";
import { localizeAppRecord } from "../i18n/localizeAppRecord";

export default function AppDetailPage() {
  const { locale, catalog } = useI18n();
  const { id } = useParams();
  const sourceApp = id ? findAppById(id) : undefined;
  const app = useMemo(
    () => (sourceApp ? localizeAppRecord(sourceApp, locale) : undefined),
    [sourceApp, locale]
  );
  const [spotlightUrl, setSpotlightUrl] = useState<string | null>(null);
  const detailText = catalog.detail;
  const quotes = detailText.quotes;

  useEffect(() => {
    setSpotlightUrl(null);

    if (
      !sourceApp ||
      !sourceApp.enabled ||
      !isListed(sourceApp) ||
      !hasAccess(sourceApp, currentUser.permissions)
    ) {
      return;
    }

    const preferredUrls = [
      `/apps/${sourceApp.id}/lesson-spotlight.html`,
      `/apps/${sourceApp.id}/game-spotlight.html`
    ];
    let isActive = true;

    const probe = async (url: string) => {
      try {
        let response = await fetch(url, { method: "HEAD" });
        if (!response.ok && response.status === 405) {
          response = await fetch(url, { method: "GET" });
        }
        return response.ok;
      } catch {
        return false;
      }
    };

    const check = async () => {
      for (const candidate of preferredUrls) {
        const ok = await probe(candidate);
        if (ok) {
          if (isActive) {
            setSpotlightUrl(candidate);
          }
          return;
        }
      }
      if (isActive) {
        setSpotlightUrl(null);
      }
    };

    check();

    return () => {
      isActive = false;
    };
  }, [sourceApp]);

  if (!id) {
    return <NotFoundPage />;
  }

  if (!sourceApp || !sourceApp.enabled || !isListed(sourceApp)) {
    return <NotFoundPage />;
  }

  if (!hasAccess(sourceApp, currentUser.permissions)) {
    return <AccessDeniedPage />;
  }

  if (!app) {
    return <NotFoundPage />;
  }

  const showSpotlight = spotlightUrl !== null;
  const detailHue = app.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const detailStyle = { "--detail-hue": detailHue } as CSSProperties;
  const quoteIndex = app.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % quotes.length;
  const selectedQuote = quotes[quoteIndex];

  return (
    <section className="page page--detail" style={detailStyle}>
      <div className="detail-hero">
        <div className="detail-card detail-card--info">
          <div className="detail-card__title">
            <AppIconBadge app={app} baseClassName="detail-card__icon" />
            <div>
              <h1>{app.name}</h1>
              <div className="detail-card__subtitle">{app.description}</div>
            </div>
          </div>
          <p className="detail-card__desc">{app.longDescription}</p>
          <div className="detail-card__meta">
            <span>{app.owner ?? "-"}</span>
            <span>{app.lastUpdated ?? "-"}</span>
          </div>
        </div>
        <div className="detail-card detail-card--cta">
          <div className="detail-card__eyebrow">{detailText.lessonReady}</div>
          <button
            className="btn btn-cta"
            onClick={() => window.open(`/run/${app.id}`, "_blank", "noopener,noreferrer")}
          >
            {detailText.startLearning}
          </button>
          <div className="detail-card__note">
            “{selectedQuote.text}” — {selectedQuote.author}
          </div>
        </div>
      </div>

      <div className="detail-grid detail-grid--single">
        {showSpotlight ? (
          <div className="detail-main">
            <div className="detail-section-header">
              <span className="detail-section-kicker">{detailText.lessonSpotlight}</span>
              <h2>{detailText.introTitle}</h2>
              <p>{detailText.introDescription}</p>
            </div>
            <div className="spotlight-frame">
              <iframe
                title={`${app.name} lesson spotlight`}
                src={spotlightUrl ?? undefined}
                loading="lazy"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
