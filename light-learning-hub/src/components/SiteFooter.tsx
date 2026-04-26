import type { ChangeEvent } from "react";
import type { Locale } from "../i18n/types";
import { useI18n } from "../i18n/I18nProvider";

type SiteFooterProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

export default function SiteFooter({ locale, onLocaleChange }: SiteFooterProps) {
  const { catalog } = useI18n();
  const topNavText = catalog.topNav;

  const handleLocaleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onLocaleChange(event.target.value as Locale);
  };

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__meta">Light Learning © 2026</div>
        <label className="footer-language" aria-label={topNavText.languageSwitcherAriaLabel}>
          <span className="footer-language__globe" aria-hidden="true">
            ◎
          </span>
          <select value={locale} onChange={handleLocaleChange}>
            <option value="zh-CN">{topNavText.chineseLanguageName}</option>
            <option value="en-US">{topNavText.englishLanguageName}</option>
          </select>
        </label>
      </div>
    </footer>
  );
}
