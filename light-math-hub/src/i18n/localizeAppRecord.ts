import type { AppRecord } from "../data/types";
import type { Locale } from "./types";

export const localizeAppRecord = (app: AppRecord, locale: Locale): AppRecord => {
  const localized = app.i18n?.[locale];
  if (!localized) {
    return app;
  }

  return {
    ...app,
    name: localized.name ?? app.name,
    description: localized.description ?? app.description,
    longDescription: localized.longDescription ?? app.longDescription,
    usage: localized.usage ?? app.usage,
    owner: localized.owner ?? app.owner,
    status: localized.status ?? app.status,
    tags: localized.tags ?? app.tags
  };
};
