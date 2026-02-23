import { Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import AccessDeniedPage from "./routes/AccessDeniedPage";
import AppDetailPage from "./routes/AppDetailPage";
import AppListPage from "./routes/AppListPage";
import ErrorPage from "./routes/ErrorPage";
import LaunchPage from "./routes/LaunchPage";
import NotFoundPage from "./routes/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<AppListPage />} />
        <Route path="/app/:id" element={<AppDetailPage />} />
      </Route>
      <Route path="/run/:id" element={<LaunchPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
