import { Link } from "react-router-dom";
import type { AppRecord } from "../data/types";
import Badge from "./Badge";
import { useI18n } from "../i18n/I18nProvider";
import { localizeAppRecord } from "../i18n/localizeAppRecord";

export default function AppTable({ apps }: { apps: AppRecord[] }) {
  const { locale, catalog } = useI18n();
  const localizedApps = apps.map((app) => localizeAppRecord(app, locale));

  return (
    <table className="app-table">
      <thead>
        <tr>
          <th>{catalog.appTable.app}</th>
          <th>{catalog.appTable.owner}</th>
          <th>{catalog.appTable.status}</th>
          <th>{catalog.appTable.updatedAt}</th>
        </tr>
      </thead>
      <tbody>
        {localizedApps.map((app) => (
          <tr key={app.id}>
            <td>
              <Link to={`/app/${app.id}`} className="app-link">
                <div className="app-name">{app.name}</div>
                <div className="app-desc">{app.description}</div>
              </Link>
            </td>
            <td>{app.owner ?? "-"}</td>
            <td>{app.status ? <Badge label={app.status} /> : "-"}</td>
            <td>{app.lastUpdated ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
