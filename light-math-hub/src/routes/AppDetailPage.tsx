import { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { currentUser } from "../data/currentUser";
import { findAppById, hasAccess, isListed } from "../data/appAccess";
import AccessDeniedPage from "./AccessDeniedPage";
import NotFoundPage from "./NotFoundPage";
import AppIconBadge from "../components/AppIconBadge";

export default function AppDetailPage() {
  const { id } = useParams();
  const app = id ? findAppById(id) : undefined;
  const [spotlightUrl, setSpotlightUrl] = useState<string | null>(null);
  const quotes = [
    {
      text: "理解比记忆更重要，步骤比答案更重要。",
      author: "Light Math Hub"
    },
    {
      text: "把抽象概念变成可见步骤，学习效率会明显提升。",
      author: "教学原则"
    },
    {
      text: "先慢后快，先准后熟，是数学训练的底层节奏。",
      author: "课堂经验"
    },
    {
      text: "好的数学练习，应该让学生看见自己的进步。",
      author: "学习设计"
    }
  ];

  useEffect(() => {
    setSpotlightUrl(null);

    if (!app || !app.enabled || !isListed(app) || !hasAccess(app, currentUser.permissions)) {
      return;
    }

    const preferredUrls = [
      `/apps/${app.id}/lesson-spotlight.html`,
      `/apps/${app.id}/game-spotlight.html`
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
  }, [app]);

  if (!id) {
    return <NotFoundPage />;
  }

  if (!app || !app.enabled || !isListed(app)) {
    return <NotFoundPage />;
  }

  if (!hasAccess(app, currentUser.permissions)) {
    return <AccessDeniedPage />;
  }

  const showSpotlight = spotlightUrl !== null;
  const detailHue = app.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
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
          <div className="detail-card__eyebrow">Lesson Ready</div>
          <button
            className="btn btn-cta"
            onClick={() => window.open(`/run/${app.id}`, "_blank", "noopener,noreferrer")}
          >
            开始学习
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
              <span className="detail-section-kicker">Lesson Spotlight</span>
              <h2>课程介绍</h2>
              <p>先看课程目标与示例，再进入训练。</p>
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
