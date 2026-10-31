import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const dir = path.resolve("dist");
const base = process.env.DEMO_BASE_PATH || "/";
const resources = [
  "index.html",
  "404.html",
  "labs/css-studio/index.html",
  "labs/canvas/index.html",
  "labs/workflow/index.html",
  "case-studies/opalubka/index.html",
  "favicon.svg"
];
for (const file of resources) {
  assert.ok(existsSync(path.join(dir, file)), "Missing built file: " + file);
}
const root = readFileSync(path.join(dir, "index.html"), "utf8");
const studio = readFileSync(path.join(dir,"labs/css-studio/index.html"),"utf8");
const canvasPage = readFileSync(path.join(dir,"labs/canvas/index.html"),"utf8");
const workflowPage = readFileSync(path.join(dir,"labs/workflow/index.html"),"utf8");
const casePage = readFileSync(path.join(dir,"case-studies/opalubka/index.html"),"utf8");
assert.match(root, /Engineering you can/);
assert.match(root, /Not available yet/);
assert.match(studio, /CSS Studio/);
assert.match(studio, /generated-css/);
assert.match(casePage, /41100450242/);
assert.match(canvasPage, /Canvas Lab/);
assert.match(canvasPage, /data-canvas-stage/);
assert.match(canvasPage, /data-canvas-static/);
assert.match(canvasPage, /JavaScript and Canvas2D are needed/);
assert.match(workflowPage, /AI Workflow Simulator/);
assert.match(workflowPage, /SIMULATION \/ NO CONNECTED AGENT/);
assert.match(workflowPage, /data-workflow-next/);
assert.ok(root.includes(base + "favicon.svg"), "favicon must use project BASE_URL");
assert.ok(root.includes(base + "labs/css-studio/"), "project path missing on lab link");
assert.ok(root.includes(base + "labs/canvas/"), "project path missing on Canvas lab link");
assert.ok(root.includes(base + "labs/workflow/"), "project path missing on Workflow Simulator link");
const astroDir = path.join(dir,"_astro");
assert.ok(existsSync(astroDir), "Astro assets directory missing");
const assets = readdirSync(astroDir);
assert.ok(assets.some(name => name.endsWith(".css")), "CSS bundle missing");
// Astro 7 may intentionally inline a very small compiled module instead of
// writing a separate JS chunk. Both forms are local and are valid build output.
const hasCompiledJsAsset = assets.some(name => name.endsWith(".js"));
const hasAstroInlinedStudio = /<script[^>]*type=["']module["'][^>]*>/.test(studio)
  && studio.includes("[data-studio-form]")
  && studio.includes("Clipboard unavailable");
assert.ok(hasCompiledJsAsset || hasAstroInlinedStudio, "Studio client JS missing from compiled output");
for (const html of [root,studio,casePage,canvasPage,workflowPage]) {
  assert.ok(html.includes(base + "_astro/"), "missing compiled CSS project prefix");
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i, "unapproved remote JS");
}
console.log("LAB_STATIC_BUILD_PASS: 5 real routes, 404, favicon, prefixed CSS and bundled/local JS, no invented live demos, base=" + base);
