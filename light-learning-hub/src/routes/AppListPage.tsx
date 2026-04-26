import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppCardGrid from "../components/AppCardGrid";
import Pagination from "../components/Pagination";
import { currentUser } from "../data/currentUser";
import { getVisibleAppsBySubject } from "../data/appAccess";
import { findSubjectById, isSubjectId } from "../data/subjects";
import { useI18n } from "../i18n/I18nProvider";
import { localizeAppRecord } from "../i18n/localizeAppRecord";
import NotFoundPage from "./NotFoundPage";

const PAGE_SIZE = 9;

export default function AppListPage() {
  const { locale, catalog } = useI18n();
  const listText = catalog.list;
  const { subject } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryText = (searchParams.get("q") ?? "").trim();
  const query = queryText.toLowerCase();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const subjectIsValid = isSubjectId(subject);
  const activeSubject = subjectIsValid ? subject : "math";
  const subjectRecord = findSubjectById(activeSubject);

  const visibleApps = useMemo(
    () =>
      getVisibleAppsBySubject(activeSubject, currentUser.permissions).map((app) =>
        localizeAppRecord(app, locale)
      ),
    [activeSubject, locale]
  );

  const filteredApps = useMemo(() => {
    if (!query) {
      return visibleApps;
    }
    return visibleApps.filter((app) => {
      const searchable = [
        app.name,
        app.description,
        app.longDescription,
        ...(app.tags ?? [])
      ].join(" ");
      return searchable.toLowerCase().includes(query);
    });
  }, [query, visibleApps]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    const hasTagParam = searchParams.has("tag");
    const shouldNormalizePage = page !== safePage;
    if (hasTagParam || shouldNormalizePage) {
      const params = new URLSearchParams(searchParams);
      if (hasTagParam) {
        params.delete("tag");
      }
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

  if (!subjectIsValid) {
    return <NotFoundPage />;
  }

  return (
    <section className="page">
      {subjectRecord ? (
        <div className="subject-headline">
          <div className="subject-headline__eyebrow">{listText.subjectEyebrow}</div>
          <h1>{subjectRecord.name[locale]}</h1>
          <p>{subjectRecord.description[locale]}</p>
        </div>
      ) : null}

      <div className="filter-summary">
        {listText.filterSummary({
          shown: pagedApps.length,
          total: filteredApps.length,
          activeTag: "",
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
