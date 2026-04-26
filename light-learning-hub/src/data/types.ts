import type { Locale } from "../i18n/types";

export type SubjectId = "math" | "english" | "history" | "science";

export type AppLocaleFields = {
  name?: string;
  description?: string;
  longDescription?: string;
  usage?: string;
  owner?: string;
  status?: string;
  tags?: string[];
};

export type AppRecord = {
  id: string;
  subject: SubjectId;
  name: string;
  icon?: string;
  listed?: boolean;
  description: string;
  longDescription: string;
  usage: string;
  owner?: string;
  lastUpdated?: string;
  enabled: boolean;
  status?: string;
  tags?: string[];
  permissions?: string[];
  entryPath: string;
  i18n?: Partial<Record<Locale, AppLocaleFields>>;
};
