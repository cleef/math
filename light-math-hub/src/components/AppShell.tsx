import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TopNav from "./TopNav";
import { currentUser } from "../data/currentUser";
import { useI18n } from "../i18n/I18nProvider";

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, setLocale } = useI18n();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(queryParam);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam, location.pathname]);

  const handleSearchSubmit = () => {
    const next = query.trim();
    const params = new URLSearchParams();
    if (next) {
      params.set("q", next);
    }
    navigate({ pathname: "/", search: params.toString() });
  };

  return (
    <div className="app-shell">
      <TopNav
        query={query}
        onQueryChange={setQuery}
        onSearchSubmit={handleSearchSubmit}
        locale={locale}
        onLocaleChange={setLocale}
        user={currentUser}
      />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
