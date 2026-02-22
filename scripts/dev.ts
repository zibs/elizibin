import { spawn } from "node:child_process";
import { watch, type FSWatcher } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";

const ROOT_DIR = process.cwd();
const DEFAULT_PORT = 5173;
const WATCH_TARGETS = ["content", "img", "scripts/build.ts"] as const;
const LIVE_RELOAD_SNIPPET = `<script>
(() => {
  if (window.__elizibinDevReload) return;
  window.__elizibinDevReload = true;
  if (!("EventSource" in window)) return;
  const source = new EventSource("/__dev/events");
  source.addEventListener("reload", () => window.location.reload());
})();
</script>`;

let buildProcess: ReturnType<typeof spawn> | null = null;
let rebuildQueued = false;
let debounceTimer: NodeJS.Timeout | null = null;
let buildCount = 0;
const changedPaths = new Set<string>();
const eventClients = new Set<ServerResponse>();
const watchers: FSWatcher[] = [];

function log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[dev ${timestamp}] ${message}`);
}

function parsePort(value: string | undefined): number {
    if (!value) {
        return DEFAULT_PORT;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error(`Invalid PORT value: ${value}`);
    }

    return parsed;
}

function isPathInsideRoot(absolutePath: string): boolean {
    const relativePath = path.relative(ROOT_DIR, absolutePath);
    return (
        relativePath === "" ||
        (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
    );
}

async function statIfExists(filePath: string): Promise<Awaited<ReturnType<typeof stat>> | null> {
    try {
        return await stat(filePath);
    } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === "ENOENT") {
            return null;
        }

        throw error;
    }
}

function decodePathname(pathname: string): string | null {
    try {
        return decodeURIComponent(pathname);
    } catch {
        return null;
    }
}

async function resolveRequestPath(pathname: string): Promise<string | null> {
    const decodedPathname = decodePathname(pathname);
    if (decodedPathname === null) {
        return null;
    }

    const normalized = decodedPathname.replaceAll("\\", "/");
    const trimmed = normalized.replace(/^\/+/, "");

    const candidates =
        trimmed === ""
            ? ["index.html"]
            : path.extname(trimmed) === ""
              ? [trimmed, path.join(trimmed, "index.html")]
              : [trimmed];

    for (const candidate of candidates) {
        const absolutePath = path.resolve(ROOT_DIR, candidate);
        if (!isPathInsideRoot(absolutePath)) {
            continue;
        }

        const fileStat = await statIfExists(absolutePath);
        if (!fileStat) {
            continue;
        }

        if (fileStat.isFile()) {
            return absolutePath;
        }

        if (fileStat.isDirectory()) {
            const directoryIndexPath = path.join(absolutePath, "index.html");
            const indexStat = await statIfExists(directoryIndexPath);
            if (indexStat?.isFile()) {
                return directoryIndexPath;
            }
        }
    }

    return null;
}

function contentTypeForPath(filePath: string): string {
    switch (path.extname(filePath).toLowerCase()) {
        case ".html":
            return "text/html; charset=utf-8";
        case ".css":
            return "text/css; charset=utf-8";
        case ".js":
        case ".mjs":
            return "application/javascript; charset=utf-8";
        case ".json":
            return "application/json; charset=utf-8";
        case ".svg":
            return "image/svg+xml";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".gif":
            return "image/gif";
        case ".webp":
            return "image/webp";
        case ".ico":
            return "image/x-icon";
        case ".txt":
            return "text/plain; charset=utf-8";
        default:
            return "application/octet-stream";
    }
}

function injectLiveReload(html: string): string {
    const bodyCloseTag = "</body>";
    const bodyCloseIndex = html.lastIndexOf(bodyCloseTag);

    if (bodyCloseIndex === -1) {
        return `${html}\n${LIVE_RELOAD_SNIPPET}\n`;
    }

    return `${html.slice(0, bodyCloseIndex)}${LIVE_RELOAD_SNIPPET}\n${html.slice(bodyCloseIndex)}`;
}

async function serveFile(response: ServerResponse, filePath: string): Promise<void> {
    const fileBuffer = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = contentTypeForPath(filePath);

    if (extension === ".html") {
        const html = injectLiveReload(fileBuffer.toString("utf8"));
        response.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": "no-store",
        });
        response.end(html);
        return;
    }

    response.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
    });
    response.end(fileBuffer);
}

function setupEventsEndpoint(
    request: IncomingMessage,
    response: ServerResponse,
): void {
    response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
    });
    response.write("retry: 500\n\n");
    eventClients.add(response);

    request.on("close", () => {
        eventClients.delete(response);
    });
}

function notifyReload(): void {
    if (eventClients.size === 0) {
        return;
    }

    for (const client of eventClients) {
        client.write(`event: reload\ndata: ${Date.now()}\n\n`);
    }

    log(`Notified ${eventClients.size} browser session(s) to reload.`);
}

function scheduleRebuild(changedPath: string): void {
    changedPaths.add(changedPath);

    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        const changed = Array.from(changedPaths);
        changedPaths.clear();

        const preview = changed.slice(0, 4).join(", ");
        const suffix = changed.length > 4 ? ` (+${changed.length - 4} more)` : "";
        runBuild(`changed: ${preview}${suffix}`);
    }, 120);
}

function runBuild(reason: string): void {
    if (buildProcess) {
        rebuildQueued = true;
        return;
    }

    buildCount += 1;
    const currentBuildCount = buildCount;

    log(`Starting build #${currentBuildCount} (${reason}).`);

    buildProcess = spawn("bun", ["run", "build"], {
        cwd: ROOT_DIR,
        env: process.env,
        stdio: "inherit",
    });

    buildProcess.once("error", (error) => {
        log(`Build process failed to start: ${error.message}`);
        buildProcess = null;
    });

    buildProcess.once("exit", (code, signal) => {
        buildProcess = null;

        if (code === 0) {
            log(`Build #${currentBuildCount} completed.`);
            notifyReload();
        } else {
            const reasonText =
                signal !== null
                    ? `signal ${signal}`
                    : `exit code ${String(code ?? "unknown")}`;
            log(`Build #${currentBuildCount} failed (${reasonText}).`);
        }

        if (rebuildQueued) {
            rebuildQueued = false;
            runBuild("queued file changes");
        }
    });
}

async function watchPath(relativePath: string): Promise<void> {
    const absolutePath = path.resolve(ROOT_DIR, relativePath);
    const targetStat = await statIfExists(absolutePath);
    if (!targetStat) {
        throw new Error(`Watch target not found: ${relativePath}`);
    }

    const targetIsDirectory = targetStat.isDirectory();
    const watcher = watch(
        absolutePath,
        { recursive: targetIsDirectory },
        (_eventType, filename) => {
            if (!filename) {
                scheduleRebuild(relativePath);
                return;
            }

            const changedPath = targetIsDirectory
                ? path.join(relativePath, filename.toString()).replaceAll(path.sep, "/")
                : relativePath;

            if (changedPath.endsWith(".DS_Store")) {
                return;
            }

            scheduleRebuild(changedPath);
        },
    );

    watchers.push(watcher);
    log(`Watching ${relativePath}`);
}

function cleanupAndExit(code: number): void {
    for (const watcher of watchers) {
        watcher.close();
    }

    if (buildProcess) {
        buildProcess.kill("SIGTERM");
    }

    process.exit(code);
}

async function start(): Promise<void> {
    const port = parsePort(process.env.PORT);

    for (const target of WATCH_TARGETS) {
        await watchPath(target);
    }

    const server = createServer(async (request, response) => {
        const parsedUrl = new URL(request.url ?? "/", "http://localhost");
        const pathname = parsedUrl.pathname;

        if (pathname === "/__dev/events") {
            setupEventsEndpoint(request, response);
            return;
        }

        const filePath = await resolveRequestPath(pathname);
        if (!filePath) {
            response.writeHead(404, {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            });
            response.end("Not found");
            return;
        }

        try {
            await serveFile(response, filePath);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown file read error";
            response.writeHead(500, {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
            });
            response.end(`Unable to serve file: ${message}`);
        }
    });

    server.on("error", (error) => {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === "EADDRINUSE") {
            console.error(
                `[dev] Port ${port} is already in use. Try PORT=5174 npm run dev.`,
            );
        } else {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`[dev] Server error: ${message}`);
        }
        cleanupAndExit(1);
    });

    server.listen(port, () => {
        log(`Serving ${ROOT_DIR} at http://localhost:${port}`);
        log("Auto-rebuild + live-reload enabled.");
    });

    setInterval(() => {
        for (const client of eventClients) {
            client.write("event: ping\ndata: 1\n\n");
        }
    }, 15000).unref();

    process.on("SIGINT", () => cleanupAndExit(0));
    process.on("SIGTERM", () => cleanupAndExit(0));

    runBuild("startup");
}

start().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[dev] Startup failed: ${message}`);
    process.exit(1);
});
