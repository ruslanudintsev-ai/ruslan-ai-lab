/**
 * Static browser-distribution check, NOT a network sandbox or legal opinion.
 * Inspect compiled dist/ independently of the 447-package development lockfile.
 * Remote GitHub links are click destinations, not eagerly fetched resources.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const allowedExtensions = new Set([".html", ".js", ".css", ".svg", ".txt"]);
const resourceRels = new Set(["stylesheet", "modulepreload", "preload", "prefetch", "icon", "manifest", "apple-touch-icon"]);
const tagPattern = /<(script|link|img|iframe|source|audio|video|form|embed|object|a)\b([^>]*)>/gi;
const attributePattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
const cssUrlPattern = /url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/gi;
const importPattern = /\bimport\s*\(\s*(["'`])([^"'`]+)\1\s*\)|\bfrom\s*(["'])([^"']+)\3/g;
const runtimeNetworkPattern = /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(|\bnavigator\.sendBeacon\s*\(|\bnew\s+(?:XMLHttpRequest|WebSocket|EventSource)\s*\(/g;

function collect(dir, prefix = "") {
  const result = [];
  for (const entry of readdirSync(path.join(dir, prefix), { withFileTypes: true })) {
    const rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...collect(dir, rel));
    else if (entry.isFile()) result.push(rel);
    else throw new Error("Unexpected symlink or device in built output: " + rel);
  }
  return result.sort();
}
function attributes(text) {
  const found = {};
  for (const match of text.matchAll(attributePattern)) found[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4];
  return found;
}
function isRemote(value) { return /^(?:https?:)?\/\//i.test(value); }

export function inspectDistribution({ distDir, base = "/ruslan-ai-lab/", sourceSha = null }) {
  const dir = path.resolve(distDir), files = collect(dir), errors = [];
  const fail = (file, reason) => errors.push(file + ": " + reason);
  const normalizedBase = "/" + base.replace(/^\/+|\/+$/g, "") + "/";
  const all = new Set(files), pages = [], assets = [];
  let externalGitHubAnchorOccurrences = 0;

  for (const rel of files) {
    const ext = path.extname(rel), bytes = readFileSync(path.join(dir, rel)), source = bytes.toString("utf8");
    if (!allowedExtensions.has(ext)) fail(rel, "unexpected distributed extension: " + ext);
    assets.push({ file: rel, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
    const resources = [];
    function requireLocal(value, kind) {
      if (!value || /^(?:data:|blob:|javascript:)/i.test(value) || isRemote(value) || /^[a-z][a-z\d+.-]*:/i.test(value)) {
        fail(rel, kind + " must be an existing local asset: " + String(value).slice(0, 100)); return;
      }
      const clean = String(value).split(/[?#]/, 1)[0];
      if (!clean) { fail(rel, kind + " has empty path"); return; }
      let target;
      if (clean.startsWith("/")) {
        if (!clean.startsWith(normalizedBase)) { fail(rel, kind + " bypasses base path: " + clean); return; }
        target = clean.slice(normalizedBase.length);
      } else target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), clean));
      if (target.startsWith("../") || !target || target.includes("\\") || !all.has(target)) {
        fail(rel, kind + " broken or escapes built output: " + String(value).slice(0, 120)); return;
      }
      resources.push(target);
    }

    if (ext === ".html") {
      for (const match of source.matchAll(tagPattern)) {
        const tag = match[1].toLowerCase(), a = attributes(match[2]);
        if (["iframe", "embed", "object"].includes(tag)) fail(rel, "unapproved embedded " + tag);
        if (tag === "a" && isRemote(a.href ?? "")) {
          try {
            const host = new URL(a.href).hostname;
            if (host !== "github.com") fail(rel, "unexpected external click destination: " + host);
            externalGitHubAnchorOccurrences++;
          } catch { fail(rel, "invalid external anchor: " + a.href); }
        }
        if (tag === "form" && a.action) fail(rel, "form action detected: " + a.action);
        if (tag === "script" && a.src) requireLocal(a.src, "script[src]");
        if (tag === "link" && (a.rel ?? "").split(/\s+/).some(x => resourceRels.has(x))) requireLocal(a.href, "link[href]");
        if (["img", "source", "audio", "video"].includes(tag) && a.src) requireLocal(a.src, tag + "[src]");
        if (a.srcset) for (const item of a.srcset.split(",")) {
          const value = item.trim().split(/\s+/)[0];
          if (value) requireLocal(value, tag + "[srcset]");
        }
        if (tag === "video" && a.poster) requireLocal(a.poster, "video[poster]");
      }
      const inline = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
      for (const [i, match] of inline.entries()) {
        if (runtimeNetworkPattern.test(match[1])) fail(rel, "inline code #" + (i + 1) + " contains a browser network API marker");
        runtimeNetworkPattern.lastIndex = 0;
      }
      pages.push({ page: rel, resources: [...new Set(resources)].sort(), inlineScriptTags: inline.length });
    } else if (ext === ".js") {
      for (const match of source.matchAll(importPattern)) requireLocal(match[2] ?? match[4], "JS module import");
      if (runtimeNetworkPattern.test(source)) fail(rel, "browser JS contains a network API marker");
      runtimeNetworkPattern.lastIndex = 0;
      if (/https?:\/\//.test(source)) fail(rel, "browser JS contains an external URL literal");
    } else if (ext === ".css") {
      if (/@import\b/i.test(source)) fail(rel, "CSS @import is not permitted");
      for (const match of source.matchAll(cssUrlPattern)) requireLocal(match[1] ?? match[2] ?? match[3], "CSS url()");
    }
  }
  const byExtension = {};
  for (const file of files) {
    const ext = path.extname(file).slice(1);
    byExtension[ext] = (byExtension[ext] ?? 0) + 1;
  }
  return {
    kind: "static-browser-distribution-review", sourceSha, base: normalizedBase,
    statement: "Static asset inventory and heuristic network markers, NOT legal clearance, an executed network sandbox, physical device QA or proof that all third-party redistribution obligations were satisfied.",
    files: assets,
    counts: {
      files: files.length, byExtension, bytes: assets.reduce((n, f) => n + f.bytes, 0),
      pages: pages.length, externalGitHubAnchorOccurrences
    },
    pages, errors
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const report = inspectDistribution({
    distDir: process.env.DIST_DIR || "dist",
    base: process.env.DEMO_BASE_PATH || "/ruslan-ai-lab/",
    sourceSha: process.env.SOURCE_SHA || null
  });
  mkdirSync("quality-results", { recursive: true });
  writeFileSync("quality-results/browser-distribution.json", JSON.stringify(report, null, 2) + "\n");
  console.log("BROWSER_DISTRIBUTION_" + (report.errors.length ? "FAIL" : "PASS") +
    ": " + report.counts.files + " files, " + report.counts.pages + " pages, " +
    report.counts.externalGitHubAnchorOccurrences + " GitHub click links, " + report.errors.length + " errors");
  for (const error of report.errors) console.error(error);
  if (report.errors.length) process.exitCode = 1;
}
