import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function resolveIdleTtlSeconds(rawMinutes: string | undefined): string | null {
  if (rawMinutes == null || rawMinutes.trim() === "") {
    // Default to no idle reclaim when Hub env is not set.
    return "0";
  }

  const parsed = Number(rawMinutes);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return String(Math.floor(parsed * 60));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appsHost = env.LIGHT_LEARNING_APPS_HOST_URL ?? env.LIGHT_APPS_HOST_URL ?? "http://localhost:5174";
  const appsApiGateway =
    env.LIGHT_LEARNING_APPS_API_GATEWAY_URL ?? env.LIGHT_APPS_API_GATEWAY_URL ?? "http://localhost:7060";
  const idleTtlSecHeader = resolveIdleTtlSeconds(
    env.LIGHT_LEARNING_APPS_IDLE_TIMEOUT_MINUTES ?? env.LIGHT_APPS_IDLE_TIMEOUT_MINUTES
  );

  return {
    plugins: [react()],
    server: {
      host: true,
      allowedHosts: ["light", "localhost", "127.0.0.1", "learning.chat1.co"],
      proxy: {
        // Proxy all learning app assets/entries under /apps/<id>/ to app host.
        "/apps": {
          target: appsHost,
          changeOrigin: true
        },
        "/api/apps": {
          target: appsApiGateway,
          changeOrigin: true,
          configure(proxy) {
            proxy.on("proxyReq", (proxyReq) => {
              if (idleTtlSecHeader !== null) {
                proxyReq.setHeader("x-light-idle-ttl-sec", idleTtlSecHeader);
              }
            });
          }
        }
      }
    }
  };
});
