// Analyzes only an inert <template> fragment. Never append user markup to the live DOM,
// make a fetch, or transfer/retain input. All rendered findings use textContent.
type Level = "error" | "warning" | "ok";
type Finding = { level: Level; title: string; detail: string };
const MAX_SIZE = 1_000_000;

export function inspectSource(html: string): Finding[] {
  if (!html.trim()) return [{ level: "error", title: "No HTML supplied", detail: "Paste an HTML document or select a local .html file." }];
  const template = document.createElement("template");
  template.innerHTML = html;
  const source = template.content;
  const findings: Finding[] = [];
  const add = (level: Level, title: string, detail: string) => findings.push({ level, title, detail });
  const texts = (selector: string) => Array.from(source.querySelectorAll(selector));
  const normalized = (value: string | null) => (value ?? "").trim();
  const metas = (name: string) => texts("meta[name]").filter((el) => normalized(el.getAttribute("name")).toLowerCase() === name);
  const links = (rel: string) => texts("link[rel]").filter((el) => normalized(el.getAttribute("rel")).toLowerCase().split(/\s+/).includes(rel));

  const titles = texts("title");
  const title = normalized(titles[0]?.textContent ?? null);
  if (!titles.length || !title) add("error", "Missing document title", "Add a nonempty <title> element in the document head.");
  else if (titles.length > 1) add("warning", "Multiple title elements", "Found " + titles.length + " <title> elements; use one document title.");
  else add("ok", "Title present", title.length + " characters: " + title.slice(0, 120));
  if (title && (title.length < 15 || title.length > 70)) add("warning", "Review title length", "The title has " + title.length + " characters. Length is an editorial hint, not a Google ranking rule.");

  const descriptions = metas("description");
  const description = normalized(descriptions[0]?.getAttribute("content") ?? null);
  if (!descriptions.length || !description) add("warning", "Missing meta description", "Consider adding a concise, page-specific meta description.");
  else if (descriptions.length > 1) add("warning", "Multiple meta descriptions", "Found " + descriptions.length + "; keep one intended description.");
  else add("ok", "Meta description present", description.length + " characters.");

  const canonicals = links("canonical");
  const canonical = normalized(canonicals[0]?.getAttribute("href") ?? null);
  if (canonicals.length > 1) add("warning", "Multiple canonicals", "Found " + canonicals.length + " canonical links; review conflicting signals.");
  else if (canonicals.length === 1 && !canonical) add("error", "Empty canonical URL", "The canonical link has no href value.");
  else if (canonicals.length === 1) add("ok", "Canonical declared", canonical.slice(0, 180));
  else add("warning", "No canonical declared", "Consider a canonical link if this page could be reached through multiple URLs. Not required for every page.");

  const robotValues = [...metas("robots"), ...metas("googlebot")].map((el) => normalized(el.getAttribute("content")).toLowerCase());
  if (robotValues.some((value) => /(?:^|[,\s])noindex(?:$|[,\s])/i.test(value))) add("warning", "Noindex detected", "A robots or googlebot meta directive includes noindex. Verify this is intentional.");
  else add("ok", "No noindex meta directive found", "This checks HTML meta tags only; HTTP X-Robots-Tag headers and robots.txt are not checked.");

  const htmlOpen = html.match(/<html\b([^>]*)>/i);
  const languageMatch = htmlOpen?.[1]?.match(/(?:^|\s)lang\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const language = normalized(languageMatch?.[1] ?? languageMatch?.[2] ?? languageMatch?.[3] ?? null);
  if (language) add("ok", "Document language declared", "html lang=\"" + language.slice(0, 40) + "\"");
  else add("warning", "Missing html lang", "Set the page's primary language on the <html> element.");

  const headings = texts("h1,h2,h3,h4,h5,h6");
  const primary = headings.filter((el) => el.tagName.toLowerCase() === "h1");
  if (primary.length !== 1) add("warning", "H1 structure", "Found " + primary.length + " H1 elements; a single clear page heading is a useful default.");
  else if (!normalized(primary[0].textContent)) add("warning", "Empty H1", "Add meaningful text to the main heading.");
  else add("ok", "H1 found", normalized(primary[0].textContent).slice(0, 120));
  const levels = headings.map((el) => Number(el.tagName.slice(1)));
  const jumps = levels.filter((level, index) => index > 0 && level > levels[index - 1] + 1).length;
  if (jumps) add("warning", "Heading level jumps", "Found " + jumps + " forward skips in H1–H6 order; review document outline.");
  else if (headings.length) add("ok", "Heading order", headings.length + " headings, no forward level jumps detected.");

  const images = texts("img");
  const missingAlt = images.filter((el) => !el.hasAttribute("alt"));
  if (missingAlt.length) add("warning", "Images missing alt attributes", missingAlt.length + " of " + images.length + " <img> elements lack alt. Decorative images may use alt=\"\".");
  else add("ok", "Image alt attributes", images.length ? "All " + images.length + " images have alt attributes (content quality not evaluated)." : "No <img> elements found.");

  const anchors = texts("a[href]");
  const unnamed = anchors.filter((el) => !normalized(el.textContent) && !normalized(el.getAttribute("aria-label")) && !normalized(el.getAttribute("title")) && !Array.from(el.querySelectorAll("img[alt]")).some((img) => normalized(img.getAttribute("alt"))));
  if (unnamed.length) add("warning", "Links without an accessible name", unnamed.length + " of " + anchors.length + " links have no text, accessible label or nonempty image alt.");
  else add("ok", "Link labels", anchors.length ? "No empty link labels detected in " + anchors.length + " links." : "No links found.");

  const jsonScripts = texts("script[type]").filter((el) => normalized(el.getAttribute("type")).split(";")[0].toLowerCase() === "application/ld+json");
  let invalid = 0;
  for (const script of jsonScripts) { try { JSON.parse(script.textContent ?? ""); } catch { invalid++; } }
  if (invalid) add("error", "Invalid JSON-LD syntax", invalid + " of " + jsonScripts.length + " JSON-LD blocks could not be parsed as JSON.");
  else if (jsonScripts.length) add("ok", "JSON-LD syntax", jsonScripts.length + " blocks contain parseable JSON. Schema semantics are not validated.");
  else add("ok", "No JSON-LD blocks", "Structured data is optional. No JSON-LD syntax check was needed.");

  return findings;
}

const form = document.querySelector<HTMLFormElement>("[data-seo-form]");
const input = document.querySelector<HTMLTextAreaElement>("[data-seo-input]");
const fileInput = document.querySelector<HTMLInputElement>("[data-seo-file]");
const status = document.querySelector<HTMLElement>("[data-seo-status]");
const results = document.querySelector<HTMLElement>("[data-seo-output]");
const list = document.querySelector<HTMLUListElement>("[data-seo-findings]");
const summary = document.querySelector<HTMLElement>("[data-seo-summary]");
const copyButton = document.querySelector<HTMLButtonElement>("[data-seo-copy]");
const clearButton = document.querySelector<HTMLButtonElement>("[data-seo-clear]");
const submitButton = document.querySelector<HTMLButtonElement>("[data-seo-submit]");
const fallback = document.querySelector<HTMLTextAreaElement>("[data-seo-fallback]");
const fallbackLabel = document.querySelector<HTMLElement>("[data-seo-fallback-label]");
let report = "";

function showStatus(message: string): void { if (status) status.textContent = message; }
function hideResults(): void {
  if (results) results.hidden = true;
  if (fallback) fallback.hidden = true;
  if (fallbackLabel) fallbackLabel.hidden = true;
  report = "";
}
if (form && input && fileInput && results && list && summary && copyButton && clearButton && submitButton && fallback && fallbackLabel) {
  submitButton.disabled = false;
  fileInput.addEventListener("change", async () => {
    hideResults();
    const file = fileInput.files?.[0];
    if (!file) return;
    if (!/\.html?$/i.test(file.name) && file.type !== "text/html") { showStatus("Choose an .html or .htm file."); return; }
    if (file.size > MAX_SIZE) { showStatus("File too large. Maximum size is 1 MB."); return; }
    try {
      const text = await file.text();
      if (fileInput.files?.[0] !== file) return;
      if (text.length > MAX_SIZE) { showStatus("File contains more than 1,000,000 characters."); return; }
      input.value = text;
      showStatus("Loaded " + file.name + " locally. Press Analyze HTML.");
    } catch { showStatus("The file could not be read in this browser."); }
  });
  input.addEventListener("input", () => { hideResults(); });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!input.value.trim()) { hideResults(); showStatus("Paste HTML or choose a local file first."); input.focus(); return; }
    if (input.value.length > MAX_SIZE) { hideResults(); showStatus("Maximum source length is 1,000,000 characters."); return; }
    const findings = inspectSource(input.value);
    const counts = { error: 0, warning: 0, ok: 0 };
    list.replaceChildren();
    for (const finding of findings) {
      counts[finding.level]++;
      const item = document.createElement("li");
      item.dataset.level = finding.level;
      const label = document.createElement("span");
      label.className = "finding-label";
      label.textContent = finding.level.toUpperCase() + " / ";
      const title = document.createElement("strong");
      title.textContent = finding.title;
      const detail = document.createElement("p");
      detail.textContent = finding.detail;
      item.append(label, title, detail);
      list.append(item);
    }
    const totals = counts.error + " errors, " + counts.warning + " cautions, " + counts.ok + " checks";
    summary.textContent = totals + ". Source-only checks; no ranking prediction.";
    report = "SEO Inspector / local source report\n" + totals + "\n\n" + findings.map((item) => "[" + item.level.toUpperCase() + "] " + item.title + "\n" + item.detail).join("\n\n") + "\n";
    results.hidden = false;
    fallback.hidden = true;
    fallbackLabel.hidden = true;
    showStatus("Analysis complete. " + totals + ".");
  });
  copyButton.addEventListener("click", async () => {
    if (!report) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unsupported");
      await navigator.clipboard.writeText(report);
      showStatus("Report copied to the clipboard.");
    } catch {
      fallback.value = report;
      fallback.hidden = false;
      fallbackLabel.hidden = false;
      fallback.focus();
      fallback.select();
      showStatus("Clipboard unavailable. Select and copy the report text.");
    }
  });
  clearButton.addEventListener("click", () => {
    input.value = "";
    fileInput.value = "";
    hideResults();
    showStatus("Cleared. No input was saved.");
    input.focus();
  });
}
