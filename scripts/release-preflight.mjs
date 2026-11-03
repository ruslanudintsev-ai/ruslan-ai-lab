/**
 * Dependency-free, read-only preflight for a compiled static website.
 * Usage: node scripts/release-preflight.mjs --dir dist --base /my-project/
 * This is a heuristic source/file check, not an HTTP crawler or a deployment test.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_FILES = 20_000;
const MAX_HTML_BYTES = 4_000_000;
const MAX_HTML_TOTAL = 80_000_000;
const tagPattern = /<(a|link|img|script|source|iframe|audio|video)\b([^>]*?)>/gi;
const attributePattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

function collectFiles(root, relative = "", found = []) {
  for (const entry of readdirSync(path.join(root, relative), { withFileTypes: true })) {
    const filename = path.posix.join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Symlinks not supported in build: " + filename);
    if (entry.isDirectory()) collectFiles(root, filename, found);
    else if (entry.isFile()) found.push(filename);
    else throw new Error("Unsupported filesystem entry: " + filename);
    if (found.length > MAX_FILES) throw new Error("Build exceeds " + MAX_FILES + " files");
  }
  return found;
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(attributePattern)) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return result;
}

function resolveLocal(value, from, base) {
  const url = value.trim();
  if (!url || url.startsWith("#") || url.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(url)) return { skip: true };
  let resource = url.split(/[?#]/, 1)[0];
  if (!resource) return { skip: true };
  try { resource = decodeURIComponent(resource); }
  catch { return { error: "invalid URL encoding" }; }
  if (resource.includes("\0") || resource.includes("\\")) return { error: "unsupported URL path" };

  let target;
  if (resource.startsWith("/")) {
    if (base !== "/" && resource !== base.slice(0, -1) && !resource.startsWith(base)) {
      return { warning: "root-relative URL outside configured base " + base };
    }
    target = base === "/" ? resource.slice(1) : resource.slice(base.length);
  } else {
    target = path.posix.join(path.posix.dirname(from), resource);
  }
  const normalized = path.posix.normalize(target);
  if (normalized === ".." || normalized.startsWith("../") || normalized.startsWith("/")) {
    return { error: "path escapes selected build directory" };
  }
  return { target: normalized === "." || normalized === "./" ? "" : normalized };
}

function targetExists(target, files) {
  if (!target) return files.has("index.html");
  if (files.has(target)) return true;
  if (target.endsWith("/")) return files.has(target + "index.html");
  if (!path.posix.basename(target).includes(".")) {
    return files.has(target + "/index.html") || files.has(target + ".html");
  }
  return false;
}

export function inspectStaticBuild({ dir = "dist", base = "/" } = {}) {
  if (!/^\/(?:[^/?#]+\/)*$/.test(base)) throw new Error("Invalid base: use / or /project/");
  const root = path.resolve(dir);
  const filenames = collectFiles(root).sort();
  const files = new Set(filenames);
  const errors = [], warnings = [];
  const pages = filenames.filter(file => /\.html?$/i.test(file));
  let references = 0, textBytes = 0;
  if (!files.has("index.html")) errors.push("Missing root index.html");
  if (!files.has("robots.txt")) warnings.push("robots.txt absent (optional; check hosting setup)");
  if (!files.has("sitemap.xml")) warnings.push("sitemap.xml absent (optional; check sitemap location)");
  const titles = new Map();

  for (const filename of pages) {
    const source = readFileSync(path.join(root, filename));
    if (source.length > MAX_HTML_BYTES) throw new Error("HTML exceeds 4 MB: " + filename);
    textBytes += source.length;
    if (textBytes > MAX_HTML_TOTAL) throw new Error("Total HTML exceeds 80 MB");
    const html = source.toString("utf8");
    const title = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(html)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
    if (!title) warnings.push(filename + ": missing/empty title");
    else titles.set(title, [...(titles.get(title) ?? []), filename]);
    if (/<base\b[^>]*\bhref\s*=/i.test(html)) {
      warnings.push(filename + ": <base href> not applied by this preflight");
    }
    for (const match of html.matchAll(tagPattern)) {
      const tag = match[1].toLowerCase();
      const attributesMap = attributes(match[2]);
      const value = (tag === "a" || tag === "link") ? attributesMap.href : attributesMap.src;
      if (value === undefined) continue;
      const result = resolveLocal(value, filename, base);
      if (result.skip) continue;
      if (result.warning) { warnings.push(filename + ": " + result.warning + " (" + value.slice(0, 120) + ")"); continue; }
      if (result.error) { errors.push(filename + ": " + result.error + " (" + value.slice(0, 120) + ")"); continue; }
      references++;
      if (!targetExists(result.target, files)) {
        errors.push(filename + ": missing " + value.slice(0, 180) + " (resolved " + result.target + ")");
      }
    }
  }
  for (const [title, filenames] of titles) {
    if (filenames.length > 1) warnings.push("Duplicate title " + JSON.stringify(title.slice(0, 100)) + ": " + filenames.slice(0, 6).join(", "));
  }
  return { dir: root, base, files: files.size, pages: pages.length, references, errors, warnings };
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--help") return { help: true };
    if (!["--dir", "--base"].includes(args[i]) || !args[i + 1]) throw new Error("Use --dir <folder> --base </prefix/>");
    options[args[i].slice(2)] = args[++i];
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log("Usage: node scripts/release-preflight.mjs --dir dist --base /project/");
    } else {
      const result = inspectStaticBuild(options);
      for (const entry of result.errors) console.error("ERROR " + entry);
      for (const entry of result.warnings) console.log("WARN " + entry);
      console.log("STATIC_PREFLIGHT_" + (result.errors.length ? "FAIL" : "PASS") +
        ": " + result.pages + " pages, " + result.references + " internal references, " +
        result.errors.length + " errors, " + result.warnings.length + " advisories");
      if (result.errors.length) process.exitCode = 1;
    }
  } catch (error) {
    console.error("STATIC_PREFLIGHT_INPUT_ERROR: " + (error instanceof Error ? error.message : String(error)));
    process.exitCode = 2;
  }
}
