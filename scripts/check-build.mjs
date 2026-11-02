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
  "labs/3d/index.html",
  "labs/workflow/index.html",
  "labs/browser-apis/index.html",
  "case-studies/opalubka/index.html",
  "case-studies/webkit-frame/index.html",
  "case-studies/release-gates/index.html",
  "projects/index.html",
  "favicon.svg"
];
for (const file of resources) {
  assert.ok(existsSync(path.join(dir, file)), "Missing built file: " + file);
}
const root = readFileSync(path.join(dir, "index.html"), "utf8");
const studio = readFileSync(path.join(dir,"labs/css-studio/index.html"),"utf8");
const workflowPage = readFileSync(path.join(dir,"labs/workflow/index.html"),"utf8");
const browserApiPage = readFileSync(path.join(dir,"labs/browser-apis/index.html"),"utf8");
const threePage = readFileSync(path.join(dir,"labs/3d/index.html"),"utf8");
const canvasPage = readFileSync(path.join(dir,"labs/canvas/index.html"),"utf8");
const casePage = readFileSync(path.join(dir,"case-studies/opalubka/index.html"),"utf8");
const webkitCasePage = readFileSync(path.join(dir,"case-studies/webkit-frame/index.html"),"utf8");
const releaseCasePage = readFileSync(path.join(dir,"case-studies/release-gates/index.html"),"utf8");
const projectsPage = readFileSync(path.join(dir,"projects/index.html"),"utf8");
assert.match(root, /Engineering you can/);
assert.doesNotMatch(root, /Not available yet/, "all four labs should be working in this source candidate");
assert.match(studio, /CSS Studio/);
assert.match(studio, /generated-css/);
assert.match(casePage, /41100450242/);
assert.match(webkitCasePage, /41182540844/);
assert.match(webkitCasePage, /494108cd1a7564bc8dc86fdf5d9ea161dacedc30/);
assert.match(releaseCasePage, /41192989794/);
assert.match(projectsPage, /Opalubka \/ LAB/);
assert.match(projectsPage, /ruslan-ai-lab\/actions\/runs\/41192989794/);
assert.match(projectsPage, /No independently verified public site release/);
assert.match(releaseCasePage, /1c13d0d3f965efc2582d38aea63aaedef8834a56/);
assert.match(canvasPage, /Canvas Lab/);
assert.match(canvasPage, /data-canvas-stage/);
assert.match(canvasPage, /data-canvas-static/);
assert.match(canvasPage, /JavaScript and Canvas2D are needed/);
assert.match(threePage, /3D Playground/);
assert.match(threePage, /data-3d-enable/);
assert.match(threePage, /WebGL has not been enabled/);
assert.match(threePage, /data-3d-static/);
assert.match(workflowPage, /AI Workflow Simulator/);
assert.match(workflowPage, /SIMULATION \/ NO CONNECTED AGENT/);
assert.match(workflowPage, /data-workflow-next/);
assert.match(browserApiPage, /Browser APIs Lab/);
assert.match(browserApiPage, /data-board-list/);
assert.match(browserApiPage, /Save to this browser/);
assert.ok(root.includes(base + "favicon.svg"), "favicon must use project BASE_URL");
assert.ok(root.includes(base + "case-studies/webkit-frame/"), "WebKit case missing on home");
assert.ok(root.includes(base + "case-studies/release-gates/"), "release case missing on home");
assert.ok(root.includes(base + "projects/"), "public project index missing on home");
assert.ok(root.includes(base + "labs/css-studio/"), "project path missing on lab link");
assert.ok(root.includes(base + "labs/canvas/"), "project path missing on Canvas lab link");
assert.ok(root.includes(base + "labs/3d/"), "project path missing on 3D Playground link");
assert.ok(root.includes(base + "labs/workflow/"), "project path missing on Workflow Simulator link");
assert.ok(root.includes(base + "labs/browser-apis/"), "project path missing on Browser APIs Lab link");
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
for (const html of [root,studio,casePage,webkitCasePage,releaseCasePage,projectsPage,canvasPage,threePage,workflowPage,browserApiPage]) {
  assert.ok(html.includes(base + "_astro/"), "missing compiled CSS project prefix");
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i, "unapproved remote JS");
}
console.log("LAB_STATIC_BUILD_PASS: 10 real routes, 404, favicon, prefixed CSS and bundled/local JS, no invented live demos, base=" + base);
