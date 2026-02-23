import { readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const appsDir = join(process.cwd(), "apps");

const isDirectory = (path) => statSync(path).isDirectory();

const apps = readdirSync(appsDir)
  .map((name) => join(appsDir, name))
  .filter(isDirectory)
  .map((path) => basename(path));

if (apps.length === 0) {
  console.log("No apps found in apps/");
} else {
  console.log("Apps:");
  apps.forEach((app) => console.log(`- ${app}`));
}
