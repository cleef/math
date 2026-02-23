import http from "node:http";
import net from "node:net";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const appsRoot = resolve(repoRoot, "apps");

const HOST = process.env.LIGHT_APPS_API_GATEWAY_HOST ?? "0.0.0.0";
const PORT = Number(process.env.LIGHT_APPS_API_GATEWAY_PORT ?? 7060);

const DEFAULT_IDLE_TTL_SEC = Number(process.env.LIGHT_APPS_API_IDLE_TTL_SEC ?? 900);
const DEFAULT_STARTUP_TIMEOUT_MS = Number(
  process.env.LIGHT_APPS_API_STARTUP_TIMEOUT_MS ?? 20000
);
const SWEEP_INTERVAL_MS = Number(process.env.LIGHT_APPS_API_SWEEP_INTERVAL_MS ?? 30000);
const SHUTDOWN_GRACE_MS = Number(process.env.LIGHT_APPS_API_SHUTDOWN_GRACE_MS ?? 5000);
const COOLDOWN_BASE_MS = Number(process.env.LIGHT_APPS_API_COOLDOWN_BASE_MS ?? 2000);
const COOLDOWN_MAX_MS = Number(process.env.LIGHT_APPS_API_COOLDOWN_MAX_MS ?? 60000);
const AUTH_TOKEN = process.env.LIGHT_APPS_API_AUTH_TOKEN ?? "";
const IDLE_TTL_OVERRIDE_HEADER = "x-light-idle-ttl-sec";
const MAX_IDLE_TTL_OVERRIDE_SEC = parsePositiveInt(
  process.env.LIGHT_APPS_API_MAX_IDLE_TTL_OVERRIDE_SEC,
  43200
);

const ALLOWED_RUNTIMES = new Set(["node", "python"]);
const ALLOWED_COMMANDS = new Set(
  (process.env.LIGHT_APPS_API_ALLOWED_COMMANDS ?? "npm,node,python,python3,uv,uvicorn")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
);

const APP_ROUTE_RE = /^\/api\/apps\/([a-z0-9-]+)(\/.*)?$/;
const STATUS_ROUTE_RE = /^\/api\/gateway\/apps\/([a-z0-9-]+)\/status$/;
const APP_ID_RE = /^[a-z0-9-]+$/;

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);

const appStates = new Map();
const startupLocks = new Map();
let shuttingDown = false;

class ManifestValidationError extends Error {
  constructor(details) {
    super("Invalid light-api.json configuration.");
    this.name = "ManifestValidationError";
    this.details = details;
  }
}

class CooldownError extends Error {
  constructor(retryAfterMs, reason) {
    super(`App runtime cooldown active. Retry in ${retryAfterMs}ms.`);
    this.name = "CooldownError";
    this.retryAfterMs = retryAfterMs;
    this.reason = reason;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function logEvent(level, event, payload = {}) {
  const record = {
    ts: nowIso(),
    level,
    event,
    ...payload
  };

  const output = JSON.stringify(record);
  if (level === "error") {
    console.error(output);
    return;
  }

  console.log(output);
}

function sanitizePath(value, fallback = "/") {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function parseIdleTtlOverrideSec(request) {
  const headerValue = request.headers[IDLE_TTL_OVERRIDE_HEADER];
  const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  if (typeof raw !== "string" || !raw.trim()) {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const normalized = Math.floor(parsed);
  if (normalized < 0) {
    return null;
  }

  if (normalized === 0) {
    return 0;
  }

  return Math.min(normalized, MAX_IDLE_TTL_OVERRIDE_SEC);
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, code, message, traceId, extra = {}) {
  sendJson(response, statusCode, {
    code,
    message,
    traceId,
    ...extra
  });
}

function readAuthToken(request) {
  const tokenHeader = request.headers["x-light-api-token"];
  if (typeof tokenHeader === "string" && tokenHeader.trim()) {
    return tokenHeader.trim();
  }

  const auth = request.headers.authorization;
  if (typeof auth === "string" && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  return "";
}

function requireAuth(request, response, traceId) {
  if (!AUTH_TOKEN) {
    return true;
  }

  const token = readAuthToken(request);
  if (token === AUTH_TOKEN) {
    return true;
  }

  sendError(
    response,
    401,
    "AUTH_REQUIRED",
    "Missing or invalid API token.",
    traceId
  );
  return false;
}

function isUpstreamConnectionError(error) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const cause = "cause" in error && error.cause && typeof error.cause === "object" ? error.cause : null;
  const code = cause && "code" in cause ? cause.code : null;

  return code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "EHOSTUNREACH";
}

function getState(appId) {
  if (!appStates.has(appId)) {
    appStates.set(appId, {
      appId,
      mode: "unknown",
      status: "stopped",
      process: null,
      pid: null,
      port: null,
      upstreamBaseUrl: null,
      lastAccessAt: null,
      startedAt: null,
      startupCount: 0,
      restartCount: 0,
      consecutiveFailures: 0,
      cooldownUntil: null,
      cooldownReason: null,
      lastError: null,
      stopRequested: false,
      manifest: null,
      idleTtlSec: DEFAULT_IDLE_TTL_SEC
    });
  }

  return appStates.get(appId);
}

function validateManifest(manifest) {
  const errors = [];

  if (manifest.runtime && !ALLOWED_RUNTIMES.has(manifest.runtime)) {
    errors.push(`runtime must be one of: ${Array.from(ALLOWED_RUNTIMES).join(", ")}`);
  }

  if (manifest.upstreamBaseUrl) {
    try {
      const parsed = new URL(manifest.upstreamBaseUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        errors.push("upstreamBaseUrl must use http or https protocol.");
      }
    } catch {
      errors.push("upstreamBaseUrl must be a valid URL.");
    }
  }

  if (!manifest.upstreamBaseUrl) {
    if (!manifest.runtime) {
      errors.push("runtime is required when upstreamBaseUrl is not set.");
    }

    if (!Array.isArray(manifest.start) || manifest.start.length === 0) {
      errors.push("start command is required when upstreamBaseUrl is not set.");
    }
  }

  if (Array.isArray(manifest.start) && manifest.start.length > 0) {
    const first = String(manifest.start[0] ?? "").trim();
    if (!first) {
      errors.push("start command first token cannot be empty.");
    } else {
      const commandName = first.split(/[\\/]/).pop();
      if (!ALLOWED_COMMANDS.has(commandName)) {
        errors.push(
          `start command '${commandName}' is not allowlisted. Allowed: ${Array.from(
            ALLOWED_COMMANDS
          ).join(", ")}`
        );
      }
    }
  }

  if (manifest.env && typeof manifest.env === "object") {
    for (const key of Object.keys(manifest.env)) {
      if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) {
        errors.push(`env key '${key}' is invalid. Use uppercase letters, numbers and underscore.`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ManifestValidationError(errors);
  }
}

async function loadManifest(appId) {
  const manifestPath = resolve(appsRoot, appId, "light-api.json");

  let raw;
  try {
    raw = await readFile(manifestPath, "utf-8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new ManifestValidationError(["light-api.json must be valid JSON."]);
  }

  if (!payload || typeof payload !== "object") {
    throw new ManifestValidationError(["light-api.json root must be a JSON object."]);
  }

  const envObject =
    payload.env && typeof payload.env === "object" && !Array.isArray(payload.env)
      ? Object.fromEntries(
          Object.entries(payload.env).map(([key, value]) => [String(key), String(value)])
        )
      : {};

  const manifest = {
    appId,
    enabled: payload.enabled !== false,
    runtime: typeof payload.runtime === "string" ? payload.runtime.trim() : null,
    start: Array.isArray(payload.start) ? payload.start.map((item) => String(item)) : null,
    healthPath: sanitizePath(payload.healthPath, "/health"),
    internalBasePath: sanitizePath(payload.internalBasePath, "/"),
    upstreamBaseUrl:
      typeof payload.upstreamBaseUrl === "string" && payload.upstreamBaseUrl.trim()
        ? payload.upstreamBaseUrl.trim()
        : null,
    startupTimeoutMs: parsePositiveInt(payload.startupTimeoutMs, DEFAULT_STARTUP_TIMEOUT_MS),
    idleTtlSec: parsePositiveInt(payload.idleTtlSec, DEFAULT_IDLE_TTL_SEC),
    env: envObject
  };

  validateManifest(manifest);
  return manifest;
}

async function allocatePort() {
  return await new Promise((resolvePort, rejectPort) => {
    const tempServer = net.createServer();

    tempServer.once("error", rejectPort);
    tempServer.listen(0, "127.0.0.1", () => {
      const address = tempServer.address();
      if (!address || typeof address === "string") {
        tempServer.close(() => rejectPort(new Error("Failed to allocate app runtime port.")));
        return;
      }

      const port = address.port;
      tempServer.close((closeError) => {
        if (closeError) {
          rejectPort(closeError);
          return;
        }
        resolvePort(port);
      });
    });
  });
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function buildTargetUrl(baseUrl, internalBasePath, remainderPath, search) {
  const target = new URL(baseUrl);
  const basePath = internalBasePath.replace(/\/$/, "") || "";
  const suffix = remainderPath.startsWith("/") ? remainderPath : `/${remainderPath}`;

  target.pathname = `${basePath}${suffix}`;
  target.search = search;
  return target;
}

function filterRequestHeaders(headers) {
  const filtered = {};

  for (const [key, value] of Object.entries(headers)) {
    if (value == null) {
      continue;
    }

    const lowered = key.toLowerCase();
    if (
      HOP_BY_HOP_HEADERS.has(lowered) ||
      lowered === "host" ||
      lowered === "content-length" ||
      lowered === IDLE_TTL_OVERRIDE_HEADER
    ) {
      continue;
    }

    filtered[key] = Array.isArray(value) ? value.join(",") : value;
  }

  return filtered;
}

function writeResponseHeaders(response, upstreamHeaders) {
  upstreamHeaders.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      return;
    }
    response.setHeader(key, value);
  });
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function proxyToTarget(request, response, appId, targetUrl, traceId) {
  const method = request.method ?? "GET";
  const body = method === "GET" || method === "HEAD" ? undefined : await readRequestBody(request);

  const upstream = await fetch(targetUrl, {
    method,
    headers: filterRequestHeaders(request.headers),
    body,
    redirect: "manual"
  });

  response.statusCode = upstream.status;
  writeResponseHeaders(response, upstream.headers);
  response.setHeader("x-light-trace-id", traceId);
  response.setHeader("x-light-app-id", appId);

  if (!upstream.body) {
    response.end();
    return;
  }

  Readable.fromWeb(upstream.body).pipe(response);
}

function watchProcessLogs(appId, stream, level) {
  if (!stream) {
    return;
  }

  stream.on("data", (chunk) => {
    const line = String(chunk).trimEnd();
    if (!line) {
      return;
    }

    logEvent(level === "stderr" ? "error" : "info", "app.log", {
      appId,
      stream: level,
      line
    });
  });
}

function buildProcessEnv(manifest, port) {
  const stringPort = String(port);
  return {
    ...process.env,
    ...manifest.env,
    PORT: stringPort,
    LIGHT_APP_PORT: stringPort,
    LIGHT_APP_ASSIGNED_PORT: stringPort,
    CODEX_CHAT_SERVER_PORT: stringPort
  };
}

function applyFailure(state, message, phase) {
  state.status = "unhealthy";
  state.lastError = message;
  state.restartCount += 1;
  state.consecutiveFailures += 1;

  const exponent = Math.max(0, state.consecutiveFailures - 1);
  const backoffMs = Math.min(COOLDOWN_MAX_MS, COOLDOWN_BASE_MS * 2 ** exponent);
  state.cooldownUntil = Date.now() + backoffMs;
  state.cooldownReason = message;

  logEvent("error", "app.failure", {
    appId: state.appId,
    phase,
    message,
    consecutiveFailures: state.consecutiveFailures,
    restartCount: state.restartCount,
    cooldownMs: backoffMs
  });
}

async function waitForHealth(state, manifest) {
  const deadline = Date.now() + manifest.startupTimeoutMs;

  while (Date.now() < deadline) {
    if (!state.process || state.process.exitCode !== null) {
      throw new Error(state.lastError ?? "App process exited during startup.");
    }

    try {
      const healthUrl = new URL(manifest.healthPath, state.upstreamBaseUrl);
      const response = await fetch(healthUrl, { method: "GET" });
      if (response.ok) {
        return;
      }
    } catch {
      // Ignore transient probe errors until timeout.
    }

    await delay(350);
  }

  throw new Error("App health check timed out.");
}

async function stopManagedRuntime(state, reason = "manual") {
  const child = state.process;
  if (!child) {
    state.status = "stopped";
    state.pid = null;
    state.port = null;
    state.upstreamBaseUrl = null;
    return;
  }

  state.stopRequested = true;

  try {
    child.kill("SIGTERM");
  } catch {
    // Ignore kill exceptions.
  }

  let exited = false;
  await Promise.race([
    once(child, "exit").then(() => {
      exited = true;
    }),
    delay(SHUTDOWN_GRACE_MS)
  ]);

  if (!exited) {
    try {
      child.kill("SIGKILL");
    } catch {
      // Ignore force kill errors.
    }
    await once(child, "exit").catch(() => {});
  }

  state.process = null;
  state.pid = null;
  state.port = null;
  state.upstreamBaseUrl = null;
  state.status = "stopped";
  state.startedAt = null;
  state.lastError = null;

  logEvent("info", "app.stopped", {
    appId: state.appId,
    reason
  });
}

async function startManagedRuntime(state, manifest) {
  const now = Date.now();
  if (state.cooldownUntil && now < state.cooldownUntil) {
    throw new CooldownError(state.cooldownUntil - now, state.cooldownReason ?? "recent failures");
  }

  if (!Array.isArray(manifest.start) || manifest.start.length === 0) {
    throw new ManifestValidationError([
      "Managed app requires non-empty 'start' command in light-api.json."
    ]);
  }

  const [command, ...args] = manifest.start;
  const appDir = resolve(appsRoot, manifest.appId);
  const port = await allocatePort();

  state.mode = "managed";
  state.status = "starting";
  state.stopRequested = false;
  state.port = port;
  state.upstreamBaseUrl = `http://127.0.0.1:${port}`;
  state.lastError = null;
  state.manifest = manifest;
  state.idleTtlSec = manifest.idleTtlSec;

  const child = spawn(command, args, {
    cwd: appDir,
    env: buildProcessEnv(manifest, port),
    stdio: ["ignore", "pipe", "pipe"]
  });

  state.process = child;
  state.pid = child.pid ?? null;

  watchProcessLogs(manifest.appId, child.stdout, "stdout");
  watchProcessLogs(manifest.appId, child.stderr, "stderr");

  child.on("exit", (code, signal) => {
    const expectedStop = state.stopRequested;

    state.process = null;
    state.pid = null;
    state.port = null;
    state.upstreamBaseUrl = null;
    state.startedAt = null;

    if (expectedStop) {
      state.status = "stopped";
      state.lastError = null;
      return;
    }

    applyFailure(
      state,
      `Process exited unexpectedly (code=${code}, signal=${signal ?? "none"}).`,
      "runtime"
    );
  });

  try {
    await waitForHealth(state, manifest);
  } catch (error) {
    await stopManagedRuntime(state, "startup-failed");

    if (state.status !== "unhealthy") {
      applyFailure(
        state,
        error instanceof Error ? error.message : "Unknown startup failure.",
        "startup"
      );
    }

    throw error;
  }

  state.status = "running";
  state.startupCount += 1;
  state.lastAccessAt = Date.now();
  state.startedAt = nowIso();
  state.consecutiveFailures = 0;
  state.cooldownUntil = null;
  state.cooldownReason = null;

  logEvent("info", "app.started", {
    appId: manifest.appId,
    pid: state.pid,
    port
  });
}

async function ensureAppReady(manifest, idleTtlSec) {
  const state = getState(manifest.appId);
  state.manifest = manifest;
  state.idleTtlSec = idleTtlSec;

  if (manifest.upstreamBaseUrl) {
    state.mode = "external";
    state.status = "running";
    state.upstreamBaseUrl = manifest.upstreamBaseUrl;
    state.lastAccessAt = Date.now();
    return state.upstreamBaseUrl;
  }

  state.mode = "managed";

  if (state.status === "running" && state.process && state.upstreamBaseUrl) {
    state.lastAccessAt = Date.now();
    return state.upstreamBaseUrl;
  }

  if (!startupLocks.has(manifest.appId)) {
    const task = startManagedRuntime(state, manifest).finally(() => {
      startupLocks.delete(manifest.appId);
    });

    startupLocks.set(manifest.appId, task);
  }

  await startupLocks.get(manifest.appId);

  if (!state.upstreamBaseUrl || state.status !== "running") {
    throw new Error(state.lastError ?? "App runtime failed to start.");
  }

  state.lastAccessAt = Date.now();
  return state.upstreamBaseUrl;
}

async function handleGatewayStatus(response, appId, traceId) {
  if (!APP_ID_RE.test(appId)) {
    sendError(response, 400, "INVALID_APP_ID", "Invalid app id format.", traceId, {
      appId
    });
    return;
  }

  const manifest = await loadManifest(appId);
  if (!manifest) {
    sendJson(response, 404, {
      appId,
      configured: false,
      status: "missing"
    });
    return;
  }

  const state = getState(appId);
  state.manifest = manifest;
  if (state.mode !== "managed" || state.status !== "running" || !state.process) {
    state.idleTtlSec = manifest.idleTtlSec;
  }

  const cooldownRemainingMs =
    state.cooldownUntil && state.cooldownUntil > Date.now()
      ? state.cooldownUntil - Date.now()
      : 0;

  sendJson(response, 200, {
    appId,
    configured: true,
    phase: "phase4",
    enabled: manifest.enabled,
    mode: manifest.upstreamBaseUrl ? "external" : "managed",
    runtime: manifest.runtime,
    status: state.status,
    pid: state.pid,
    port: state.port,
    startupCount: state.startupCount,
    restartCount: state.restartCount,
    consecutiveFailures: state.consecutiveFailures,
    startedAt: state.startedAt,
    lastAccessAt: state.lastAccessAt ? new Date(state.lastAccessAt).toISOString() : null,
    idleTtlSec: state.idleTtlSec,
    healthPath: manifest.healthPath,
    internalBasePath: manifest.internalBasePath,
    upstreamBaseUrl: manifest.upstreamBaseUrl ?? state.upstreamBaseUrl,
    cooldownUntil:
      state.cooldownUntil && cooldownRemainingMs > 0
        ? new Date(state.cooldownUntil).toISOString()
        : null,
    cooldownRemainingMs,
    lastError: state.lastError
  });
}

async function maybeReclaimIdleRuntime(state) {
  if (
    state.mode !== "managed" ||
    state.status !== "running" ||
    !state.process ||
    !state.lastAccessAt
  ) {
    return;
  }

  const idleMs = Date.now() - state.lastAccessAt;
  const ttlMs = state.idleTtlSec * 1000;
  if (ttlMs <= 0 || idleMs < ttlMs) {
    return;
  }

  await stopManagedRuntime(state, "idle-timeout");
}

const sweeperTimer = setInterval(() => {
  for (const state of appStates.values()) {
    maybeReclaimIdleRuntime(state).catch((error) => {
      logEvent("error", "app.idle_reclaim_error", {
        appId: state.appId,
        message: error instanceof Error ? error.message : String(error)
      });
    });
  }
}, SWEEP_INTERVAL_MS);
sweeperTimer.unref();

const server = http.createServer(async (request, response) => {
  const traceId = randomUUID();
  const method = request.method ?? "GET";
  const requestPath = request.url ?? "/";
  const startedAtMs = Date.now();
  let appIdForLog = null;

  response.on("finish", () => {
    logEvent("info", "request.completed", {
      traceId,
      method,
      path: requestPath,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAtMs,
      appId: appIdForLog
    });
  });

  try {
    const url = new URL(requestPath, "http://localhost");

    if (url.pathname === "/api/gateway/health") {
      sendJson(response, 200, {
        ok: true,
        service: "light-apps-api-gateway",
        phase: "phase4",
        timestamp: nowIso()
      });
      return;
    }

    if (!requireAuth(request, response, traceId)) {
      return;
    }

    const statusMatch = url.pathname.match(STATUS_ROUTE_RE);
    if (statusMatch) {
      appIdForLog = statusMatch[1];
      await handleGatewayStatus(response, statusMatch[1], traceId);
      return;
    }

    const appRouteMatch = url.pathname.match(APP_ROUTE_RE);
    if (!appRouteMatch) {
      sendError(response, 404, "ROUTE_NOT_FOUND", "Route not found.", traceId);
      return;
    }

    const appId = appRouteMatch[1];
    const remainder = appRouteMatch[2] ?? "/";
    appIdForLog = appId;

    if (!APP_ID_RE.test(appId)) {
      sendError(response, 400, "INVALID_APP_ID", "Invalid app id format.", traceId, {
        appId
      });
      return;
    }

    const manifest = await loadManifest(appId);
    if (!manifest) {
      sendError(
        response,
        404,
        "APP_API_NOT_CONFIGURED",
        "App backend manifest light-api.json not found.",
        traceId,
        { appId }
      );
      return;
    }

    if (!manifest.enabled) {
      sendError(response, 403, "APP_API_DISABLED", "App backend is disabled.", traceId, {
        appId
      });
      return;
    }

    const idleTtlOverrideSec = parseIdleTtlOverrideSec(request);
    const effectiveIdleTtlSec = idleTtlOverrideSec ?? manifest.idleTtlSec;
    const upstreamBaseUrl = await ensureAppReady(manifest, effectiveIdleTtlSec);
    const targetUrl = buildTargetUrl(upstreamBaseUrl, manifest.internalBasePath, remainder, url.search);
    await proxyToTarget(request, response, appId, targetUrl, traceId);

    const state = getState(appId);
    state.lastAccessAt = Date.now();
  } catch (error) {
    if (error instanceof ManifestValidationError) {
      sendError(
        response,
        400,
        "APP_MANIFEST_INVALID",
        "light-api.json validation failed.",
        traceId,
        { details: error.details, appId: appIdForLog }
      );
      return;
    }

    if (error instanceof CooldownError) {
      sendError(
        response,
        429,
        "APP_RUNTIME_COOLDOWN",
        error.message,
        traceId,
        {
          appId: appIdForLog,
          retryAfterMs: error.retryAfterMs,
          reason: error.reason ?? null
        }
      );
      return;
    }

    if (isUpstreamConnectionError(error)) {
      sendError(
        response,
        502,
        "APP_UPSTREAM_UNREACHABLE",
        "App backend upstream is unreachable.",
        traceId,
        { appId: appIdForLog }
      );
      return;
    }

    logEvent("error", "gateway.error", {
      traceId,
      appId: appIdForLog,
      message: error instanceof Error ? error.message : String(error)
    });

    sendError(
      response,
      500,
      "GATEWAY_INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unexpected gateway error.",
      traceId,
      { appId: appIdForLog }
    );
  }
});

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logEvent("info", "gateway.shutdown", { signal });

  clearInterval(sweeperTimer);

  const stops = [];
  for (const state of appStates.values()) {
    if (state.mode === "managed" && state.process) {
      stops.push(
        stopManagedRuntime(state, `shutdown-${signal}`).catch((error) => {
          logEvent("error", "app.shutdown_error", {
            appId: state.appId,
            message: error instanceof Error ? error.message : String(error)
          });
        })
      );
    }
  }

  await Promise.all(stops);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((error) => {
    logEvent("error", "gateway.shutdown_failed", {
      signal: "SIGINT",
      message: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((error) => {
    logEvent("error", "gateway.shutdown_failed", {
      signal: "SIGTERM",
      message: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  });
});

server.listen(PORT, HOST, () => {
  logEvent("info", "gateway.started", {
    host: HOST,
    port: PORT,
    authEnabled: Boolean(AUTH_TOKEN)
  });
});
