import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import { JSDOM } from "jsdom";

type Camera = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type SceneExtraction = {
    elements: Array<Record<string, unknown>>;
    appState?: Record<string, unknown>;
    files: Record<string, unknown> | null;
};

type StylePreset = "handdrawn-soft" | "none";

type CliOptions = {
    inputPath?: string;
    slug: string;
    name: string;
    outDir: string;
    generatePng: boolean;
    stylePreset: StylePreset;
};

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const EXCALIDRAW_FONT_ASSETS_DIR = path.join(
    REPO_ROOT,
    "node_modules",
    "@excalidraw",
    "utils",
    "dist",
    "prod",
    "assets",
);
const RESVG_FONT_FILES = [
    "Virgil.ttf",
    "Excalifont.ttf",
    "Cascadia Code.ttf",
    "Nunito ExtraLight Medium.ttf",
    "Comic Shanns Regular.ttf",
    "Lilita One.ttf",
    "Liberation Sans.ttf",
]
    .map((fileName) => path.join(EXCALIDRAW_FONT_ASSETS_DIR, fileName))
    .filter((fontPath) => existsSync(fontPath));

const CONTROL_TYPES = new Set(["cameraUpdate", "restoreCheckpoint", "delete"]);
const KEBAB_PATTERN = /^[a-z0-9-]+$/;
let hasBootstrappedDom = false;

function usage(): string {
    return `
Create blog assets from Excalidraw checkpoint JSON.

Usage:
  bun run scripts/excalidraw-blog-asset.ts --slug <slug> --name <name> [--input <path>|-]

Options:
  --input, -i   Input JSON file. Use "-" or omit to read from stdin.
  --slug,  -s   Blog slug (kebab-case). Used under img/blog/<slug>/.
  --name,  -n   Asset base filename (kebab-case), no extension.
  --out-dir, -o Output base directory (default: img/blog).
  --style-preset Style preset to apply before export (handdrawn-soft|none).
  --png         Generate PNG from Excalidraw-native SVG (default behavior).
  --no-png      Skip PNG generation and write SVG only.
  --no-style-preset Alias for --style-preset none.
  --help, -h    Show this message.

Examples:
  bun run excalidraw:asset -- --input /tmp/diagram.json --slug mcp-post --name flow
  cat /tmp/diagram.json | bun run excalidraw:asset -- --slug mcp-post --name flow
`.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    return fallback;
}

function toPositiveNumber(value: unknown, fallback: number): number {
    const parsed = toFiniteNumber(value, fallback);
    return parsed > 0 ? parsed : fallback;
}

function tryParseJson(text: string): unknown | null {
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function parseArgs(argv: string[]): CliOptions {
    let inputPath: string | undefined;
    let slug = "";
    let name = "";
    let outDir = "img/blog";
    let generatePng = true;
    let stylePreset: StylePreset = "handdrawn-soft";

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];

        if (token === "--help" || token === "-h") {
            console.log(usage());
            process.exit(0);
        }

        if (token === "--input" || token === "-i") {
            const value = argv[index + 1];
            if (!value) {
                throw new Error("Missing value for --input.");
            }
            inputPath = value;
            index += 1;
            continue;
        }

        if (token === "--slug" || token === "-s") {
            const value = argv[index + 1];
            if (!value) {
                throw new Error("Missing value for --slug.");
            }
            slug = value;
            index += 1;
            continue;
        }

        if (token === "--name" || token === "-n") {
            const value = argv[index + 1];
            if (!value) {
                throw new Error("Missing value for --name.");
            }
            name = value;
            index += 1;
            continue;
        }

        if (token === "--out-dir" || token === "-o") {
            const value = argv[index + 1];
            if (!value) {
                throw new Error("Missing value for --out-dir.");
            }
            outDir = value;
            index += 1;
            continue;
        }

        if (token === "--style-preset") {
            const value = argv[index + 1];
            if (!value) {
                throw new Error("Missing value for --style-preset.");
            }
            if (value !== "handdrawn-soft" && value !== "none") {
                throw new Error("`--style-preset` must be one of: handdrawn-soft, none.");
            }
            stylePreset = value;
            index += 1;
            continue;
        }

        if (token === "--no-style-preset") {
            stylePreset = "none";
            continue;
        }

        if (token === "--no-png") {
            generatePng = false;
            continue;
        }

        if (token === "--png") {
            generatePng = true;
            continue;
        }

        throw new Error(`Unknown argument: ${token}`);
    }

    if (!slug || !KEBAB_PATTERN.test(slug)) {
        throw new Error("`--slug` is required and must be kebab-case (a-z, 0-9, hyphen).");
    }

    if (!name || !KEBAB_PATTERN.test(name)) {
        throw new Error("`--name` is required and must be kebab-case (a-z, 0-9, hyphen).");
    }

    return {
        inputPath,
        slug,
        name,
        outDir,
        generatePng,
        stylePreset,
    };
}

function readFromStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (process.stdin.isTTY) {
            reject(
                new Error(
                    'No --input provided and stdin is empty. Pass --input <path> or pipe JSON into stdin.',
                ),
            );
            return;
        }

        let data = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk: string) => {
            data += chunk;
        });
        process.stdin.on("end", () => resolve(data));
        process.stdin.on("error", (error) => reject(error));
    });
}

async function readInputText(inputPath?: string): Promise<string> {
    if (!inputPath || inputPath === "-") {
        return readFromStdin();
    }

    const absoluteInputPath = path.resolve(process.cwd(), inputPath);
    return readFile(absoluteInputPath, "utf8");
}

function extractScene(inputText: string): SceneExtraction {
    const queue: unknown[] = [inputText];
    const seenStrings = new Set<string>();

    while (queue.length > 0) {
        const current = queue.shift();

        if (typeof current === "string") {
            const trimmed = current.trim();
            if (trimmed === "" || seenStrings.has(trimmed)) {
                continue;
            }

            seenStrings.add(trimmed);
            const parsed = tryParseJson(trimmed);
            if (parsed !== null) {
                queue.push(parsed);
            }
            continue;
        }

        if (Array.isArray(current)) {
            const elementCandidates = current.filter(
                (item): item is Record<string, unknown> =>
                    isRecord(item) && typeof item.type === "string",
            );

            if (elementCandidates.length > 0) {
                return {
                    elements: elementCandidates,
                    files: null,
                };
            }

            for (const item of current) {
                if (isRecord(item) && typeof item.text === "string") {
                    queue.push(item.text);
                }
            }

            continue;
        }

        if (isRecord(current)) {
            if (Array.isArray(current.elements)) {
                const elementCandidates = current.elements.filter(
                    (item): item is Record<string, unknown> =>
                        isRecord(item) && typeof item.type === "string",
                );

                if (elementCandidates.length > 0) {
                    const files = isRecord(current.files) ? current.files : null;
                    const appState = isRecord(current.appState) ? current.appState : undefined;
                    return {
                        elements: elementCandidates,
                        appState,
                        files,
                    };
                }
            }

            if (typeof current.text === "string") {
                queue.push(current.text);
            }
        }
    }

    throw new Error(
        'Could not find an `elements` array in the provided input. Pass JSON from `read_checkpoint`.',
    );
}

function parseDeleteIds(value: unknown): string[] {
    if (typeof value !== "string") {
        return [];
    }

    return value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
}

function parseCamera(element: Record<string, unknown>): Camera | null {
    if (element.type !== "cameraUpdate") {
        return null;
    }

    const width = toPositiveNumber(element.width, 0);
    const height = toPositiveNumber(element.height, 0);
    if (width <= 0 || height <= 0) {
        return null;
    }

    return {
        x: toFiniteNumber(element.x, 0),
        y: toFiniteNumber(element.y, 0),
        width,
        height,
    };
}

function resolveFinalState(elements: Array<Record<string, unknown>>): {
    camera: Camera | null;
    drawables: Array<Record<string, unknown>>;
} {
    let camera: Camera | null = null;
    const resolved: Array<Record<string, unknown> | null> = [];
    const indexById = new Map<string, number>();

    for (const rawElement of elements) {
        const cameraUpdate = parseCamera(rawElement);
        if (cameraUpdate) {
            camera = cameraUpdate;
            continue;
        }

        const type = typeof rawElement.type === "string" ? rawElement.type : "";

        if (type === "restoreCheckpoint") {
            continue;
        }

        if (type === "delete") {
            const ids = parseDeleteIds(rawElement.ids);
            for (const id of ids) {
                const index = indexById.get(id);
                if (index === undefined) {
                    continue;
                }
                resolved[index] = null;
                indexById.delete(id);
            }
            continue;
        }

        const elementId = typeof rawElement.id === "string" ? rawElement.id : undefined;
        const isDeleted = rawElement.isDeleted === true;
        if (isDeleted && elementId) {
            const index = indexById.get(elementId);
            if (index !== undefined) {
                resolved[index] = null;
                indexById.delete(elementId);
            }
            continue;
        }

        if (elementId && indexById.has(elementId)) {
            const index = indexById.get(elementId);
            if (index !== undefined) {
                const previous = resolved[index] ?? {};
                resolved[index] = {
                    ...previous,
                    ...rawElement,
                };
            }
            continue;
        }

        resolved.push({ ...rawElement });
        if (elementId) {
            indexById.set(elementId, resolved.length - 1);
        }
    }

    const drawables = resolved.filter((element): element is Record<string, unknown> => {
        if (!element) {
            return false;
        }

        const type = typeof element.type === "string" ? element.type : "";
        if (type === "") {
            return false;
        }

        return !CONTROL_TYPES.has(type) && element.isDeleted !== true;
    });

    return { camera, drawables };
}

const SHAPE_TYPES = new Set(["rectangle", "ellipse", "diamond"]);

const HANDDRAWN_SOFT = {
    shapeStrokeColor: "#f08c00",
    shapeBackgroundColor: "#fcc2d7",
    arrowStrokeColor: "#1c7ed6",
    textColor: "#1f1f1f",
    strokeWidth: 2,
    roughness: 1,
    opacity: 100,
    fillStyle: "hachure",
} as const;

function readColor(value: unknown, fallback: string): string {
    if (typeof value !== "string") {
        return fallback;
    }
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "transparent" || trimmed === "none") {
        return fallback;
    }
    return trimmed;
}

function readStrokeStyle(value: unknown, fallback = "solid"): string {
    if (value === "solid" || value === "dashed" || value === "dotted") {
        return value;
    }
    return fallback;
}

function readOpacity(value: unknown, fallback: number): number {
    const opacity = toFiniteNumber(value, fallback);
    if (opacity < 0) {
        return 0;
    }
    if (opacity > 100) {
        return 100;
    }
    return opacity;
}

function normalizeShapeElement(
    element: Record<string, unknown>,
): Record<string, unknown> {
    const normalized: Record<string, unknown> = {
        ...element,
        fillStyle: HANDDRAWN_SOFT.fillStyle,
        backgroundColor: readColor(
            element.backgroundColor,
            HANDDRAWN_SOFT.shapeBackgroundColor,
        ),
        strokeColor: readColor(element.strokeColor, HANDDRAWN_SOFT.shapeStrokeColor),
        strokeWidth: toPositiveNumber(element.strokeWidth, HANDDRAWN_SOFT.strokeWidth),
        strokeStyle: readStrokeStyle(element.strokeStyle),
        roughness: toPositiveNumber(element.roughness, HANDDRAWN_SOFT.roughness),
        opacity: readOpacity(element.opacity, HANDDRAWN_SOFT.opacity),
    };

    if (element.type === "rectangle" && !isRecord(element.roundness)) {
        normalized.roundness = { type: 3 };
    }

    return normalized;
}

function normalizeArrowLikeElement(
    element: Record<string, unknown>,
): Record<string, unknown> {
    const normalized: Record<string, unknown> = {
        ...element,
        strokeColor: readColor(element.strokeColor, HANDDRAWN_SOFT.arrowStrokeColor),
        strokeWidth: toPositiveNumber(element.strokeWidth, HANDDRAWN_SOFT.strokeWidth),
        strokeStyle: readStrokeStyle(element.strokeStyle),
        roughness: toPositiveNumber(element.roughness, HANDDRAWN_SOFT.roughness),
        opacity: readOpacity(element.opacity, HANDDRAWN_SOFT.opacity),
    };

    if (element.type === "arrow" && typeof element.endArrowhead !== "string") {
        normalized.endArrowhead = "arrow";
    }

    return normalized;
}

function normalizeTextElement(
    element: Record<string, unknown>,
): Record<string, unknown> {
    return {
        ...element,
        strokeColor: readColor(element.strokeColor, HANDDRAWN_SOFT.textColor),
        fontFamily:
            typeof element.fontFamily === "number" ? element.fontFamily : 1,
        opacity: readOpacity(element.opacity, HANDDRAWN_SOFT.opacity),
    };
}

function applyStylePresetToElement(
    element: Record<string, unknown>,
    stylePreset: StylePreset,
): Record<string, unknown> {
    if (stylePreset === "none") {
        return { ...element };
    }

    const type = typeof element.type === "string" ? element.type : "";
    if (SHAPE_TYPES.has(type)) {
        return normalizeShapeElement(element);
    }
    if (type === "arrow" || type === "line") {
        return normalizeArrowLikeElement(element);
    }
    if (type === "text") {
        return normalizeTextElement(element);
    }

    return { ...element };
}

function applyStylePreset(
    drawables: Array<Record<string, unknown>>,
    stylePreset: StylePreset,
): Array<Record<string, unknown>> {
    return drawables.map((element) =>
        applyStylePresetToElement(element, stylePreset),
    );
}

function defineGlobal(name: string, value: unknown): void {
    Object.defineProperty(globalThis, name, {
        value,
        configurable: true,
        writable: true,
    });
}

function ensureDomGlobals(): void {
    if (hasBootstrappedDom) {
        return;
    }

    const dom = new JSDOM("<!doctype html><html><body></body></html>", {
        url: "https://excalidraw.local/",
        pretendToBeVisual: true,
    });

    const window = dom.window;
    defineGlobal("window", window);
    defineGlobal("document", window.document);
    defineGlobal("navigator", window.navigator);
    defineGlobal("location", window.location);
    defineGlobal("DOMParser", window.DOMParser);
    defineGlobal("Node", window.Node);
    defineGlobal("Element", window.Element);
    defineGlobal("HTMLElement", window.HTMLElement);
    defineGlobal("SVGElement", window.SVGElement);
    defineGlobal("SVGSVGElement", window.SVGSVGElement);
    defineGlobal("HTMLCanvasElement", window.HTMLCanvasElement);
    defineGlobal("Image", window.Image);
    defineGlobal("Blob", window.Blob);
    defineGlobal("URL", window.URL);
    defineGlobal("atob", window.atob.bind(window));
    defineGlobal("btoa", window.btoa.bind(window));
    defineGlobal("getComputedStyle", window.getComputedStyle.bind(window));
    defineGlobal("performance", window.performance);
    defineGlobal("requestAnimationFrame", window.requestAnimationFrame.bind(window));
    defineGlobal("cancelAnimationFrame", window.cancelAnimationFrame.bind(window));
    defineGlobal("devicePixelRatio", 1);

    if (!("ResizeObserver" in globalThis)) {
        defineGlobal(
            "ResizeObserver",
            class {
                observe(): void {
                    // no-op
                }
                unobserve(): void {
                    // no-op
                }
                disconnect(): void {
                    // no-op
                }
            },
        );
    }

    if (!("FontFace" in globalThis)) {
        defineGlobal(
            "FontFace",
            class {
                family: string;
                source: string;
                descriptors?: Record<string, unknown>;
                status = "loaded";
                style = "normal";
                weight = "400";
                stretch = "normal";
                unicodeRange = "U+0-10FFFF";
                variant = "normal";
                featureSettings = "normal";
                display = "auto";

                constructor(
                    family: string,
                    source: string,
                    descriptors?: Record<string, unknown>,
                ) {
                    this.family = family;
                    this.source = source;
                    this.descriptors = descriptors;
                    if (descriptors) {
                        if (typeof descriptors.style === "string") {
                            this.style = descriptors.style;
                        }
                        if (
                            typeof descriptors.weight === "string" ||
                            typeof descriptors.weight === "number"
                        ) {
                            this.weight = String(descriptors.weight);
                        }
                        if (typeof descriptors.stretch === "string") {
                            this.stretch = descriptors.stretch;
                        }
                        if (typeof descriptors.unicodeRange === "string") {
                            this.unicodeRange = descriptors.unicodeRange;
                        }
                        if (typeof descriptors.variant === "string") {
                            this.variant = descriptors.variant;
                        }
                        if (typeof descriptors.featureSettings === "string") {
                            this.featureSettings = descriptors.featureSettings;
                        }
                        if (typeof descriptors.display === "string") {
                            this.display = descriptors.display;
                        }
                    }
                }

                load(): Promise<this> {
                    return Promise.resolve(this);
                }
            },
        );
    }

    const docWithFonts = window.document as unknown as { fonts?: unknown };
    if (!docWithFonts.fonts) {
        const fontsStub = {
            add: (_fontFace: unknown) => fontsStub,
            ready: Promise.resolve(undefined),
            load: async () => [],
            check: () => true,
        };
        docWithFonts.fonts = fontsStub;
    }

    hasBootstrappedDom = true;
}

function coerceAppState(appState?: Record<string, unknown>): Record<string, unknown> {
    return {
        viewBackgroundColor: "#ffffff",
        exportWithDarkMode: false,
        ...(appState ?? {}),
    };
}

async function renderExcalidrawSvg(
    drawables: Array<Record<string, unknown>>,
    appState?: Record<string, unknown>,
    files: Record<string, unknown> | null = null,
): Promise<string> {
    ensureDomGlobals();

    const { exportToSvg } = await import("@excalidraw/utils");
    const svgElement = await exportToSvg({
        elements: drawables as never,
        appState: coerceAppState(appState) as never,
        files: (files ?? null) as never,
        exportPadding: 24,
    });

    return svgElement.outerHTML;
}

function renderPngFromSvg(svg: string): Uint8Array {
    const resvg = new Resvg(svg, {
        fitTo: { mode: "original" },
        font: {
            fontFiles: RESVG_FONT_FILES,
            loadSystemFonts: true,
        },
    });

    return resvg.render().asPng();
}

function toRepoRelative(absolutePath: string): string {
    return path.relative(REPO_ROOT, absolutePath).split(path.sep).join("/");
}

function buildSnippet(preferredImagePath: string): string {
    return `{
    type: "image",
    src: "${preferredImagePath}",
    alt: "TODO: add meaningful diagram alt text",
    caption: "TODO: optional caption",
}`;
}

function buildSourceScene(
    drawables: Array<Record<string, unknown>>,
    appState?: Record<string, unknown>,
    files: Record<string, unknown> | null = null,
): Record<string, unknown> {
    return {
        type: "excalidraw",
        version: 2,
        source: "https://excalidraw.com",
        elements: drawables,
        appState: coerceAppState(appState),
        files: files ?? {},
    };
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    console.log("[1/5] Reading Excalidraw checkpoint input...");
    const inputText = await readInputText(options.inputPath);
    const extracted = extractScene(inputText);
    const { camera, drawables } = resolveFinalState(extracted.elements);
    const styledDrawables = applyStylePreset(drawables, options.stylePreset);

    if (styledDrawables.length === 0) {
        throw new Error("No drawable Excalidraw elements found after resolving checkpoint state.");
    }

    const targetDirectory = path.join(REPO_ROOT, options.outDir, options.slug);
    await mkdir(targetDirectory, { recursive: true });

    const jsonPath = path.join(targetDirectory, `${options.name}.excalidraw.json`);
    const svgPath = path.join(targetDirectory, `${options.name}.svg`);
    const pngPath = path.join(targetDirectory, `${options.name}.png`);

    console.log(`[2/5] Writing source JSON -> ${toRepoRelative(jsonPath)}`);
    const sceneForDisk = buildSourceScene(
        styledDrawables,
        extracted.appState,
        extracted.files,
    );
    await writeFile(jsonPath, `${JSON.stringify(sceneForDisk, null, 2)}\n`, "utf8");

    console.log(`[3/5] Rendering Excalidraw-native SVG -> ${toRepoRelative(svgPath)}`);
    const svg = await renderExcalidrawSvg(
        styledDrawables,
        extracted.appState,
        extracted.files,
    );
    await writeFile(svgPath, `${svg}\n`, "utf8");

    let pngCreated = false;
    if (options.generatePng) {
        console.log(`[4/5] Rendering PNG from SVG -> ${toRepoRelative(pngPath)}`);

        try {
            const pngBytes = renderPngFromSvg(svg);
            await writeFile(pngPath, pngBytes);
            pngCreated = true;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[warn] PNG conversion failed: ${message}. SVG is ready to use.`);
        }
    } else {
        console.log("[4/5] PNG generation skipped (--no-png).");
    }

    const preferredImagePath = pngCreated
        ? `/${toRepoRelative(pngPath)}`
        : `/${toRepoRelative(svgPath)}`;

    console.log("[5/5] Done.");
    console.log(`- Source JSON: /${toRepoRelative(jsonPath)}`);
    console.log(`- SVG: /${toRepoRelative(svgPath)}`);
    if (pngCreated) {
        console.log(`- PNG: /${toRepoRelative(pngPath)}`);
    }
    if (camera) {
        console.log(
            `- Camera (from checkpoint): x=${camera.x}, y=${camera.y}, width=${camera.width}, height=${camera.height}`,
        );
    }
    console.log(`- Style preset: ${options.stylePreset}`);
    console.log("");
    console.log("Blog block snippet:");
    console.log(buildSnippet(preferredImagePath));
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[error] ${message}`);
    console.error("");
    console.error(usage());
    process.exit(1);
});
