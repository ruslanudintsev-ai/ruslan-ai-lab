import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { inspectStaticBuild } from "../../scripts/release-preflight.mjs";

function fixture(files) {
  const dir = mkdtempSync(path.join(tmpdir(), "static-preflight-"));
  for (const [name, content] of Object.entries(files)) {
    const filename = path.join(dir, name);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, content);
  }
  return dir;
}
function withFixture(files, fn) {
  const dir = fixture(files);
  try { return fn(dir); }
  finally { rmSync(dir, { force: true, recursive: true }); }
}
const page = (title, body) => '<!doctype html><html lang="en"><head><title>' + title + '</title></head><body>' + body + '</body></html>';

test("valid project-prefix build checks real links without a network", () => {
  withFixture({
    "index.html": page("Welcome", '<a href="/demo/about/">About</a><link rel="stylesheet" href="/demo/_astro/style.css"><img src="/demo/logo.svg?x=1#y">'),
    "about/index.html": page("About", '<a href="/demo/">Home</a><a href="https://example.org/whatever">External</a>'),
    "_astro/style.css": "body{}",
    "logo.svg": "<svg/>",
    "robots.txt": "User-agent: *\nAllow: /",
    "sitemap.xml": "<urlset></urlset>"
  }, dir => {
    const result = inspectStaticBuild({ dir, base: "/demo/" });
    assert.equal(result.errors.length, 0);
    assert.equal(result.warnings.length, 0);
    assert.equal(result.pages, 2);
    assert.equal(result.references, 4);
  });
});

test("broken references fail, while repeated titles are advisories", () => {
  withFixture({
    "index.html": page("Same title", '<a href="/demo/missing/">Lost</a><img src="/demo/absent.png">'),
    "about/index.html": page("Same title", '<a href="../">Home</a>')
  }, dir => {
    const result = inspectStaticBuild({ dir, base: "/demo/" });
    assert.equal(result.errors.length, 2);
    assert(result.errors.some(e => e.includes("missing/")));
    assert(result.errors.some(e => e.includes("absent.png")));
    assert(result.warnings.some(w => w.includes("Duplicate title")));
  });
});

test("missing root page is a blocker, optional sitemap and robots are not", () => {
  withFixture({ "about.html": page("About", "") }, dir => {
    const result = inspectStaticBuild({ dir });
    assert(result.errors.some(e => e.includes("index.html")));
    assert(result.warnings.some(w => w.includes("robots.txt")));
    assert(result.warnings.some(w => w.includes("sitemap.xml")));
  });
});

test("path escaping is blocked and out-of-prefix links are flagged", () => {
  withFixture({
    "index.html": page("Home", '<a href="/other-project/">Other project</a>'),
    "deep/index.html": page("Deep", '<img src="../../../secret.png">')
  }, dir => {
    const result = inspectStaticBuild({ dir, base: "/demo/" });
    assert(result.errors.some(e => e.includes("escapes selected build directory")));
    assert(result.warnings.some(w => w.includes("outside configured base")));
  });
});

test("CLI returns exit 1 for broken build, exit 0 for valid build", () => {
  const script = fileURLToPath(new URL("../../scripts/release-preflight.mjs", import.meta.url));
  withFixture({ "index.html": page("Home", '<a href="missing/">Lost</a>') }, dir => {
    const run = spawnSync(process.execPath, [script, "--dir", dir, "--base", "/"], { encoding: "utf8" });
    assert.equal(run.status, 1);
    assert.match(run.stdout, /STATIC_PREFLIGHT_FAIL/);
    assert.match(run.stderr, /ERROR index.html: missing/);
  });
  withFixture({ "index.html": page("Home", "") }, dir => {
    const run = spawnSync(process.execPath, [script, "--dir", dir, "--base", "/"], { encoding: "utf8" });
    assert.equal(run.status, 0);
    assert.match(run.stdout, /STATIC_PREFLIGHT_PASS/);
  });
});

test("bad base is rejected before reading source", () => {
  assert.throws(() => inspectStaticBuild({ dir: ".", base: "demo" }), /Invalid base/);
});
