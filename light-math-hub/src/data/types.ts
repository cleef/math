export type AppRecord = {
  id: string;
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
};
