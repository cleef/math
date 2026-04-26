import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import SiteFooter from "./SiteFooter";
import { useI18n } from "../i18n/I18nProvider";

export default function AppShell() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="app-shell">
      <TopNav locale={locale} />
      <main className="app-main">
        <Outlet />
      </main>
      <SiteFooter locale={locale} onLocaleChange={setLocale} />
    </div>
  );
}
