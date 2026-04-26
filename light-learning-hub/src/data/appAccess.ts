import appsData from "./apps.json";
import type { AppRecord, SubjectId } from "./types";

const apps = appsData as AppRecord[];

export const getAllApps = () => apps;

export const hasAccess = (app: AppRecord, userPermissions: string[]) => {
  if (userPermissions.includes(`light.subject.${app.subject}`)) {
    return true;
  }

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

export const getVisibleAppsBySubject = (subject: SubjectId, userPermissions: string[]) =>
  getVisibleApps(userPermissions).filter((app) => app.subject === subject);

export const findAppById = (id: string) => apps.find((app) => app.id === id);
