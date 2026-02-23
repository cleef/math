import type { AppRecord } from "../data/types";

const IMAGE_EXT_RE = /\.(svg|png|jpe?g|gif|webp|avif|ico)$/i;
const REMOTE_ICON_RE = /^(https?:\/\/|data:image\/|\/|\.\/)/i;

export type ResolvedAppIcon =
  | { kind: "image"; src: string }
  | { kind: "text"; text: string }
  | { kind: "none" };

const looksLikeImage = (icon: string) =>
  REMOTE_ICON_RE.test(icon) || IMAGE_EXT_RE.test(icon) || icon.includes("/");

const toAppAssetPath = (appId: string, icon: string) => {
  if (/^(https?:\/\/|data:image\/|\/)/i.test(icon)) {
    return icon;
  }
  const normalized = icon.replace(/^\.\//, "");
  return `/apps/${appId}/${normalized}`;
};

export const resolveAppIcon = (
  app: Pick<AppRecord, "id" | "icon">
): ResolvedAppIcon => {
  const value = app.icon?.trim();
  if (!value) {
    return { kind: "none" };
  }

  if (looksLikeImage(value)) {
    return {
      kind: "image",
      src: toAppAssetPath(app.id, value)
    };
  }

  return {
    kind: "text",
    text: value
  };
};

export const getFallbackIconText = (name: string) => {
  const cleaned = name.trim().replace(/\s+/g, " ");
  if (!cleaned) {
    return "AP";
  }

  const words = cleaned.split(" ");
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }

  return cleaned.slice(0, 2).toUpperCase();
};
