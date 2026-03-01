import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  readFileSync(resolve(here, "light-app.json"), "utf-8")
);
const appId = manifest.id;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: `/apps/${appId}/`,
  server: {
    host: true,
    allowedHosts: ["light"]
  },
  build: {
    outDir: resolve(here, `../../dist/apps/${appId}`),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(here, "index.html"),
        gameSpotlight: resolve(here, "game-spotlight.html")
      }
    }
  }
});
