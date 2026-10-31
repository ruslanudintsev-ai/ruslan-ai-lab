import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { inspectDistribution } from "../../scripts/audit-distribution.mjs";

function fixture(callback) {
  const distDir = mkdtempSync(path.join(os.tmpdir(), "lab-static-audit-"));
  const write = (file, content) => {
    mkdirSync(path.dirname(path.join(distDir, file)), { recursive: true });
    writeFileSync(path.join(distDir, file), content);
  };
  write("index.html", `<html><head><link rel="stylesheet" href="/ruslan-ai-lab/_astro/lab.css"></head><body><a href="https://github.com/ruslanudintsev-ai/ruslan-ai-lab">Source</a><script type="module" src="/ruslan-ai-lab/_astro/main.js"></script></body></html>`);
  write("_astro/main.js", "import './helper.js'; console.info('local lab');");
  write("_astro/helper.js", "export const value=42;");
  write("_astro/lab.css", ".local{background:#fff}");
  try { return callback({ write, audit: () => inspectDistribution({ distDir, base: "/ruslan-ai-lab/", sourceSha: "fixture" }) }); }
  finally { rmSync(distDir, { recursive: true, force: true }); }
}

test("local static imports and GitHub anchors pass with repeatable SHA-256 manifests", () => fixture(({ audit }) => {
  const report = audit();
  assert.deepEqual(report, audit());
  assert.deepEqual(report.errors, []);
  assert.equal(report.counts.files, 4);
  assert.equal(report.counts.externalGitHubAnchorOccurrences, 1);
  assert.deepEqual(report.pages[0].resources, ["_astro/lab.css", "_astro/main.js"]);
  assert.match(report.files[0].sha256, /^[0-9a-f]{64}$/);
}));

test("external scripts and styles fail even if hidden in static HTML", () => fixture(({ write, audit }) => {
  write("index.html", '<link rel="stylesheet" href="https://fonts.example.org/font.css"><script src="https://cdn.example.org/app.js"></script>');
  const errors = audit().errors;
  assert.equal(errors.length, 2);
  assert.ok(errors.some(x => x.includes("script[src]")));
}));

test("missing compiled assets and a project-base bypass are blocked", () => fixture(({ write, audit }) => {
  write("index.html", '<script src="/wrong-path/_astro/main.js"></script><script src="/ruslan-ai-lab/_astro/missing.js"></script>');
  assert.equal(audit().errors.length, 2);
}));

test("JS network operations and external module imports are flagged", () => fixture(({ write, audit }) => {
  write("_astro/main.js", "const live=()=>fetch('/api'); import('https://remote.example.com/helper.js');");
  const errors = audit().errors;
  assert.ok(errors.some(x => x.includes("network API marker")));
  assert.ok(errors.some(x => x.includes("JS module import")));
  assert.ok(errors.some(x => x.includes("external URL literal")));
}));

test("form submissions and unexpected outbound links are visible blockers", () => fixture(({ write, audit }) => {
  write("index.html", '<form action="/submit" method="post"></form><a href="https://other.example.org">Unverified</a>');
  const errors = audit().errors;
  assert.ok(errors.some(x => x.includes("form action")));
  assert.ok(errors.some(x => x.includes("external click destination")));
}));

test("CSS external @import/url and image srcset are blocked", () => fixture(({ write, audit }) => {
  write("_astro/lab.css", "@import url('https://fonts.example.org/css');.x{background:url(https://img.example.org/x.png)}");
  write("index.html", '<img srcset="https://img.example.org/a.webp 1x">');
  const errors = audit().errors;
  assert.ok(errors.some(x => x.includes("CSS @import")));
  assert.ok(errors.some(x => x.includes("CSS url()")));
  assert.ok(errors.some(x => x.includes("img[srcset]")));
}));
