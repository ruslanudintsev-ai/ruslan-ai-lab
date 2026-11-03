// Read-only static build preflight. The selected directory never leaves the browser.
type Level = "error" | "warning" | "ok";
type Finding = { level: Level; title: string; detail: string };
type SourceFile = { path: string; file: File };
const MAX_FILES = 400;
const MAX_TEXT_BYTES = 8_000_000;
const MAX_SINGLE_TEXT_BYTES = 1_000_000;
const MAX_FINDINGS = 250;

function cleanPath(value: string): string | null {
  if (!value || value.includes("\\") || value.includes("\0")) return null;
  const parts: string[] = [];
  for (const part of value.replace(/^\/+/, "").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") { if (!parts.length) return null; parts.pop(); }
    else parts.push(part);
  }
  return parts.join("/");
}

function resourcePath(raw: string, from: string, base: string): string | null {
  const reference = raw.trim();
  if (!reference || reference.startsWith("#") || reference.startsWith("//") || /^[a-z][\w+.-]*:/i.test(reference)) return null;
  let rawPath = reference.split(/[?#]/, 1)[0];
  try { rawPath = decodeURIComponent(rawPath); } catch { return null; }
  if (rawPath.includes("\0")) return null;
  if (rawPath.startsWith("/")) {
    if (base !== "/") {
      if (!rawPath.startsWith(base)) return null; // outside this project's configured deployment path
      rawPath = rawPath.slice(base.length);
    } else rawPath = rawPath.replace(/^\/+/, "");
  } else rawPath = from.slice(0, from.lastIndexOf("/") + 1) + rawPath;
  return cleanPath(rawPath);
}

function hasTarget(reference: string, paths: Set<string>): boolean {
  if (!reference) return paths.has("index.html");
  if (paths.has(reference)) return true;
  if (reference.endsWith("/")) return paths.has(reference + "index.html");
  if (!reference.split("/").at(-1)?.includes(".")) return paths.has(reference + "/index.html") || paths.has(reference + ".html");
  return false;
}

function addFinding(findings: Finding[], level: Level, title: string, detail: string): void {
  if (findings.length < MAX_FINDINGS) findings.push({ level, title, detail });
}

export async function inspectFolder(files: File[], base: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  if (files.length === 0) return [{ level: "error", title: "No folder selected", detail: "Choose a compiled static build folder first." }];
  if (files.length > MAX_FILES) return [{ level: "error", title: "File limit exceeded", detail: "This MVP supports at most " + MAX_FILES + " files; selected " + files.length + "." }];
  if (!/^\/(?:[^/?#]+\/)*$/.test(base)) return [{ level: "error", title: "Invalid public base path", detail: "Use / or a slash-prefixed, slash-terminated path such as /my-site/." }];

  const firstRelative = files.find((file) => file.webkitRelativePath)?.webkitRelativePath ?? "";
  const root = firstRelative.includes("/") ? firstRelative.slice(0, firstRelative.indexOf("/") + 1) : "";
  const index = new Map<string, SourceFile>();
  for (const file of files) {
    const rel = file.webkitRelativePath || file.name;
    if (root && !rel.startsWith(root)) {
      addFinding(findings, "error", "Inconsistent selected folder", rel.slice(0, 150));
      continue;
    }
    const path = cleanPath(rel.slice(root.length));
    if (!path) { addFinding(findings, "error", "Unsafe file path", rel.slice(0, 150)); continue; }
    if (index.has(path)) { addFinding(findings, "error", "Duplicate build path", path); continue; }
    index.set(path, { path, file });
  }
  const paths = new Set(index.keys());
  if (!paths.has("index.html")) addFinding(findings, "error", "Missing index.html", "Select the output folder itself, not its parent. Expected index.html at the build root.");
  else addFinding(findings, "ok", "Root document present", "index.html exists in the selected build.");

  if (!paths.has("robots.txt")) addFinding(findings, "warning", "No robots.txt found", "Review whether the deployed site needs a robots.txt file.");
  else addFinding(findings, "ok", "robots.txt present", "File existence only; crawler access rules are not validated.");

  if (!paths.has("sitemap.xml")) addFinding(findings, "warning", "No sitemap.xml found", "Check whether the site publishes its sitemap elsewhere or does not need one.");
  else addFinding(findings, "ok", "sitemap.xml present", "Checking local sitemap paths where possible.");

  const selected = [...index.values()].filter(({ path }) => /\.html?$/i.test(path) || path === "sitemap.xml" || path === "robots.txt");
  const totalBytes = selected.reduce((sum, item) => sum + item.file.size, 0);
  if (totalBytes > MAX_TEXT_BYTES) return [...findings, { level: "error", title: "Text read limit exceeded", detail: "Selected HTML/XML/text totals " + totalBytes + " bytes. Limit is 8,000,000 bytes." }];
  if (selected.some(({ file }) => file.size > MAX_SINGLE_TEXT_BYTES)) return [...findings, { level: "error", title: "Individual file too large", detail: "Each HTML/XML/text file must be at most 1,000,000 bytes." }];

  const pageTitles = new Map<string, string[]>();
  let pageCount = 0;
  let internalCount = 0;
  let missingCount = 0;
  for (const { path, file } of selected) {
    if (!/\.html?$/i.test(path)) continue;
    pageCount++;
    const fragment = document.createElement("template");
    fragment.innerHTML = await file.text();
    const title = fragment.content.querySelector("title")?.textContent?.trim() ?? "";
    if (!title) addFinding(findings, "warning", "Missing/empty HTML title", path);
    else pageTitles.set(title, [...(pageTitles.get(title) ?? []), path]);
    if (fragment.content.querySelector("base[href]")) addFinding(findings, "warning", "HTML base href not evaluated", path + ": this checker resolves relative links against document paths, not <base href>.");
    for (const element of fragment.content.querySelectorAll("a[href], link[href], img[src], script[src], source[src], iframe[src], video[src]")) {
      const attribute = element.hasAttribute("href") ? "href" : "src";
      const value = element.getAttribute(attribute) ?? "";
      if (/^javascript:/i.test(value.trim())) { addFinding(findings, "warning", "JavaScript URL in markup", path + ": " + value.slice(0, 100)); continue; }
      const target = resourcePath(value, path, base);
      if (target === null) continue;
      internalCount++;
      if (!hasTarget(target, paths)) {
        missingCount++;
        addFinding(findings, "error", "Missing internal target", path + " → " + value.slice(0, 150) + " (resolved: " + target + ")");
      }
    }
  }
  for (const [title, pages] of pageTitles) if (pages.length > 1)
    addFinding(findings, "warning", "Repeated HTML title", pages.length + " pages share " + JSON.stringify(title.slice(0, 90)) + ": " + pages.slice(0, 4).join(", "));

  const sitemap = index.get("sitemap.xml");
  if (sitemap) {
    const documentXml = new DOMParser().parseFromString(await sitemap.file.text(), "application/xml");
    if (documentXml.querySelector("parsererror")) addFinding(findings, "error", "Invalid sitemap XML", "sitemap.xml could not be parsed as XML.");
    else {
      const locs = Array.from(documentXml.getElementsByTagName("*")).filter((element) => element.localName === "loc");
      let missingSitemap = 0;
      for (const loc of locs) {
        const value = loc.textContent?.trim() ?? "";
        let pathname = "";
        try { pathname = new URL(value, location.href).pathname; } catch { continue; }
        const target = resourcePath(pathname, "sitemap.xml", base);
        if (target !== null && !hasTarget(target, paths)) {
          missingSitemap++;
          addFinding(findings, "warning", "Sitemap URL missing locally", value.slice(0, 150));
        }
      }
      addFinding(findings, missingSitemap ? "warning" : "ok", "Sitemap paths inspected", locs.length + " loc elements; " + missingSitemap + " missing local targets. Hosting redirects are not tested.");
    }
  }
  addFinding(findings, missingCount ? "error" : "ok", "Internal asset and link inventory", pageCount + " HTML pages; " + internalCount + " checked internal href/src references; " + missingCount + " missing.");
  addFinding(findings, "ok", "Local inspection scope", index.size + " selected build files; no network requests, uploads, rendering or server checks.");
  if (findings.length >= MAX_FINDINGS) findings.push({ level: "warning", title: "Finding output truncated", detail: "Too many individual findings. Fix visible errors and inspect again; results are not complete." });
  return findings;
}

const form = document.querySelector<HTMLFormElement>("[data-release-form]");
const input = document.querySelector<HTMLInputElement>("[data-release-dir]");
const baseInput = document.querySelector<HTMLInputElement>("[data-release-base]");
const status = document.querySelector<HTMLElement>("[data-release-status]");
const runButton = document.querySelector<HTMLButtonElement>("[data-release-run]");
const clearButton = document.querySelector<HTMLButtonElement>("[data-release-clear]");
const results = document.querySelector<HTMLElement>("[data-release-results]");
const list = document.querySelector<HTMLElement>("[data-release-findings]");
const summary = document.querySelector<HTMLElement>("[data-release-summary]");
const copy = document.querySelector<HTMLButtonElement>("[data-release-copy]");
const copyText = document.querySelector<HTMLTextAreaElement>("[data-release-copy-fallback]");
const copyLabel = document.querySelector<HTMLElement>("[data-release-copy-label]");
let report = "";
const setStatus = (message: string) => { if (status) status.textContent = message; };
const hide = () => { if (results) results.hidden = true; if (copyText) copyText.hidden = true; if (copyLabel) copyLabel.hidden = true; report = ""; };
if (form && input && baseInput && status && runButton && clearButton && results && list && summary && copy && copyText && copyLabel) {
  // Directory input is attached only when JavaScript is active; without JS, Analyze stays disabled.
  input.setAttribute("webkitdirectory", "");
  runButton.disabled = false;
  input.addEventListener("change", () => { hide(); setStatus(input.files?.length + " local files selected. Press Inspect build."); });
  baseInput.addEventListener("input", hide);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    runButton.disabled = true;
    setStatus("Inspecting selected files locally…");
    hide();
    try {
      const findings = await inspectFolder(Array.from(input.files ?? []), baseInput.value.trim());
      const counts = { error: 0, warning: 0, ok: 0 };
      list.replaceChildren();
      for (const finding of findings) {
        counts[finding.level]++;
        const li = document.createElement("li");
        li.dataset.level = finding.level;
        const label = document.createElement("span");
        label.textContent = finding.level.toUpperCase();
        const heading = document.createElement("strong");
        heading.textContent = finding.title;
        const detail = document.createElement("p");
        detail.textContent = finding.detail;
        li.append(label, heading, detail);
        list.append(li);
      }
      const countText = counts.error + " errors, " + counts.warning + " cautions, " + counts.ok + " confirmations.";
      summary.textContent = countText + " Local source only — no guarantee of deploy success.";
      report = "Release Inspector / local build preflight\nBase: " + baseInput.value.trim() + "\n" + countText + "\n\n" + findings.map((finding) => "[" + finding.level.toUpperCase() + "] " + finding.title + "\n" + finding.detail).join("\n\n") + "\n";
      results.hidden = false;
      setStatus("Inspection complete. " + countText);
    } catch {
      setStatus("Inspection failed. Check folder permissions and try again.");
    } finally { runButton.disabled = false; }
  });
  clearButton.addEventListener("click", () => {
    input.value = ""; baseInput.value = "/"; hide();
    setStatus("Cleared. No selected files were saved.");
  });
  copy.addEventListener("click", async () => {
    if (!report) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(report);
      setStatus("Report copied.");
    } catch {
      copyText.value = report;
      copyText.hidden = false; copyLabel.hidden = false;
      copyText.focus(); copyText.select();
      setStatus("Clipboard unavailable. Select and copy the report text.");
    }
  });
}
