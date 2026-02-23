import appsData from "./apps.json";
import type { AppRecord } from "./types";

const apps = appsData as AppRecord[];

export const getAllApps = () => apps;

export const hasAccess = (app: AppRecord, userPermissions: string[]) => {
  if (!app.permissions || app.permissions.length === 0) {
    return true;
  }
  return app.permissions.some((permission) => userPermissions.includes(permission));
};

export const isListed = (app: AppRecord) => app.listed !== false;

export const isVisible = (app: AppRecord, userPermissions: string[]) =>
  app.enabled && isListed(app) && hasAccess(app, userPermissions);

export const getVisibleApps = (userPermissions: string[]) =>
  apps.filter((app) => isVisible(app, userPermissions));

export const findAppById = (id: string) => apps.find((app) => app.id === id);
