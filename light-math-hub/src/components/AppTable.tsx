import { Link } from "react-router-dom";
import type { AppRecord } from "../data/types";
import Badge from "./Badge";

export default function AppTable({ apps }: { apps: AppRecord[] }) {
  return (
    <table className="app-table">
      <thead>
        <tr>
          <th>课程应用</th>
          <th>维护方</th>
          <th>状态</th>
          <th>更新时间</th>
        </tr>
      </thead>
      <tbody>
        {apps.map((app) => (
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
