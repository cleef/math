import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AppCardGrid from "../components/AppCardGrid";
import Pagination from "../components/Pagination";
import { currentUser } from "../data/currentUser";
import { getVisibleApps } from "../data/appAccess";

const PAGE_SIZE = 9;

export default function AppListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const tagParam = (searchParams.get("tag") ?? "").trim();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const visibleApps = useMemo(() => getVisibleApps(currentUser.permissions), []);

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
      return (
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query)
      );
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
          <div className="tag-filter__label">知识分类</div>
          <div className="tag-filter__chips">
            <button
              type="button"
              className={`tag-chip ${activeTag === "" ? "tag-chip--active" : ""}`}
              onClick={() => handleTagChange("")}
            >
              全部
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
        当前展示 {pagedApps.length} / {filteredApps.length}
        {activeTag ? ` 个「${activeTag}」课程` : " 个课程"}
        {query ? `（匹配关键词：${query}）` : ""}
      </div>

      {pagedApps.length === 0 ? (
        <div className="empty-state">
          <h2>未找到匹配课程</h2>
          <p>请尝试其他关键词，或清空筛选条件。</p>
        </div>
      ) : (
        <AppCardGrid apps={pagedApps} />
      )}

      <Pagination page={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
    </section>
  );
}
