import { readdirSync, statSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const appsDir = join(process.cwd(), "apps");

const isDirectory = (path) => statSync(path).isDirectory();

const appDirs = readdirSync(appsDir)
  .map((name) => join(appsDir, name))
  .filter(isDirectory)
  .filter((path) => existsSync(join(path, "light-app.json")));

if (appDirs.length === 0) {
  console.log("No apps with light-app.json found in apps/");
  process.exit(0);
}

for (const appPath of appDirs) {
  const appName = basename(appPath);
  const nodeModulesPath = join(appPath, "node_modules");

  if (!existsSync(nodeModulesPath)) {
    console.log(`\nInstalling dependencies for ${appName}...`);
    const install = spawnSync("npm", ["install"], {
      cwd: appPath,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    if (install.status !== 0) {
      console.error(`Install failed for ${appName}.`);
      process.exit(install.status ?? 1);
    }
  }

  console.log(`\nBuilding ${appName}...`);
  const result = spawnSync("npm", ["run", "build"], {
    cwd: appPath,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    console.error(`Build failed for ${appName}.`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nAll apps built successfully.");
