import { useMemo, useState } from "react";
import type { AppRecord } from "../data/types";
import { getFallbackIconText, resolveAppIcon } from "../utils/appIcon";

type Props = {
  app: AppRecord;
  baseClassName: string;
};

export default function AppIconBadge({ app, baseClassName }: Props) {
  const [imageBroken, setImageBroken] = useState(false);
  const resolved = useMemo(
    () => resolveAppIcon(app),
    [app.id, app.icon]
  );

  const fallbackText = getFallbackIconText(app.name);
  const text = resolved.kind === "text" ? resolved.text : fallbackText;

  if (resolved.kind === "image" && !imageBroken) {
    return (
      <span className={`${baseClassName} ${baseClassName}--image`} aria-hidden="true">
        <img
          src={resolved.src}
          alt=""
          loading="lazy"
          onError={() => setImageBroken(true)}
        />
      </span>
    );
  }

  return (
    <span className={`${baseClassName} ${baseClassName}--text`} aria-hidden="true">
      {text}
    </span>
  );
}
