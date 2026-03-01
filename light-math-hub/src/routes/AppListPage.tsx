import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AppCardGrid from "../components/AppCardGrid";
import Pagination from "../components/Pagination";
import { currentUser } from "../data/currentUser";
import { getVisibleApps } from "../data/appAccess";
import { useI18n } from "../i18n/I18nProvider";
import { localizeAppRecord } from "../i18n/localizeAppRecord";

const PAGE_SIZE = 9;

export default function AppListPage() {
  const { locale, catalog } = useI18n();
  const listText = catalog.list;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryText = (searchParams.get("q") ?? "").trim();
  const query = queryText.toLowerCase();
  const tagParam = (searchParams.get("tag") ?? "").trim();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const visibleApps = useMemo(
    () => getVisibleApps(currentUser.permissions).map((app) => localizeAppRecord(app, locale)),
    [locale]
  );

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    visibleApps.forEach((app) => {
      app.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [visibleApps]);

  const activeTag = tagParam && availableTags.includes(tagParam) ? tagParam : "";

  const filteredApps = useMemo(() => {
    let result = visibleApps;
    if (activeTag) {
      result = result.filter((app) => app.tags?.includes(activeTag));
    }
    if (!query) {
      return result;
    }
    return result.filter((app) => {
      const searchable = [
        app.name,
        app.description,
        app.longDescription,
        ...(app.tags ?? [])
      ].join(" ");
      return searchable.toLowerCase().includes(query);
    });
  }, [activeTag, query, visibleApps]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) {
      const params = new URLSearchParams(searchParams);
      params.set("page", safePage.toString());
      setSearchParams(params, { replace: true });
    }
  }, [page, safePage, searchParams, setSearchParams]);

  const pagedApps = filteredApps.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", nextPage.toString());
    setSearchParams(params);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <section className="page">
      {availableTags.length > 0 ? (
        <div className="tag-filter">
          <div className="tag-filter__label">{listText.tagFilterLabel}</div>
          <div className="tag-filter__chips">
            <button
              type="button"
              className={`tag-chip ${activeTag === "" ? "tag-chip--active" : ""}`}
              onClick={() => handleTagChange("")}
            >
              {listText.allTagLabel}
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-chip ${activeTag === tag ? "tag-chip--active" : ""}`}
                onClick={() => handleTagChange(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="filter-summary">
        {listText.filterSummary({
          shown: pagedApps.length,
          total: filteredApps.length,
          activeTag,
          query: queryText
        })}
      </div>

      {pagedApps.length === 0 ? (
        <div className="empty-state">
          <h2>{listText.emptyTitle}</h2>
          <p>{listText.emptyDescription}</p>
        </div>
      ) : (
        <AppCardGrid apps={pagedApps} />
      )}

      <Pagination page={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
    </section>
  );
}
