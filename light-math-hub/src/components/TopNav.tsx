import { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import type { Locale } from "../i18n/types";

type UserInfo = {
  name: string;
  role: string;
  roleEn?: string;
};

type TopNavProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  user: UserInfo;
};

export default function TopNav({
  query,
  onQueryChange,
  onSearchSubmit,
  locale,
  onLocaleChange,
  user
}: TopNavProps) {
  const { catalog } = useI18n();
  const topNavText = catalog.topNav;
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearchSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearchSubmit();
    }
  };

  const displayRole =
    locale === "en-US" ? user.roleEn ?? topNavText.roleFallback : user.role ?? topNavText.roleFallback;

  return (
    <header className="top-nav">
      <Link to="/" className="top-nav__brand" aria-label={topNavText.homeAriaLabel}>
        <div className="brand-mark" aria-hidden="true">
          MH
        </div>
        <div className="brand-copy">
          <div className="brand-title">LIGHT MATH HUB</div>
          <div className="brand-subtitle">{topNavText.brandSubtitle}</div>
        </div>
      </Link>
      <form className="top-nav__search" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          placeholder={topNavText.searchPlaceholder}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={topNavText.searchAriaLabel}
        />
        <button type="submit" className="btn btn-secondary">
          {topNavText.searchButton}
        </button>
      </form>
      <div className="top-nav__right">
        <div className="top-nav__lang" role="group" aria-label={topNavText.languageSwitcherAriaLabel}>
          <button
            type="button"
            className={`lang-switch ${locale === "zh-CN" ? "lang-switch--active" : ""}`}
            onClick={() => onLocaleChange("zh-CN")}
          >
            {topNavText.chineseLabel}
          </button>
          <button
            type="button"
            className={`lang-switch ${locale === "en-US" ? "lang-switch--active" : ""}`}
            onClick={() => onLocaleChange("en-US")}
          >
            {topNavText.englishLabel}
          </button>
        </div>
        <div className="top-nav__user" aria-label={topNavText.currentUserAriaLabel}>
          <div className="user-avatar" aria-hidden="true">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-role">{displayRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
