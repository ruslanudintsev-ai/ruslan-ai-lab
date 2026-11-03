import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const url = new URL("tools/release-inspector/", root).toString();

function fixture(files) {
  const dir = mkdtempSync(path.join(tmpdir(), "release-inspector-"));
  for (const [relative, text] of Object.entries(files)) {
    const name = path.join(dir, relative);
    mkdirSync(path.dirname(name), { recursive: true });
    writeFileSync(name, text);
  }
  return dir;
}
async function inspect(page, dir, base = "/") {
  await page.goto(url);
  await page.locator("[data-release-base]").fill(base);
  await page.locator("[data-release-dir]").setInputFiles(dir);
  await page.getByRole("button", { name: "Inspect build" }).click();
  await expect(page.locator("[data-release-results]")).toBeVisible();
}
const html = (title, content) => `<!doctype html><html lang="en"><head><title>${title}</title></head><body><h1>Hello</h1>${content}</body></html>`;

test("homepage links to local Release Inspector, valid nested build has no errors", async ({ page }) => {
  const dir = fixture({
    "index.html": html("Home build page", '<a href="/ruslan-ai-lab/about/">About</a><img src="/ruslan-ai-lab/assets/logo.svg" alt="Logo"><script src="/ruslan-ai-lab/app.js"></script>'),
    "about/index.html": html("About the team", '<a href="/ruslan-ai-lab/">Home</a>'),
    "assets/logo.svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"/>",
    "app.js": "/* compiled asset */",
    "robots.txt": "User-agent: *\nAllow: /",
    "sitemap.xml": '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.org/ruslan-ai-lab/</loc></url><url><loc>https://example.org/ruslan-ai-lab/about/</loc></url></urlset>'
  });
  try {
    await page.goto(root);
    await page.getByRole("link", { name: "Release Inspector" }).first().click();
    await expect(page).toHaveURL(url);
    await inspect(page, dir, "/ruslan-ai-lab/");
    await expect(page.locator("[data-level=error]")).toHaveCount(0);
    await expect(page.locator("[data-release-summary]")).toContainText("0 errors");
    await expect(page.getByText("Internal asset and link inventory")).toBeVisible();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("broken links, missing assets and repeated titles are shown with concrete paths", async ({ page }) => {
  const dir = fixture({
    "index.html": html("Repeated title", '<a href="missing/">Missing page</a><img src="/assets/gone.png"><a href="javascript:alert(1)">Unsafe link</a>'),
    "other/index.html": html("Repeated title", "<p>Hello</p>")
  });
  try {
    await inspect(page, dir);
    await expect(page.getByText("Missing internal target")).toHaveCount(2);
    await expect(page.getByText("Repeated HTML title")).toBeVisible();
    await expect(page.getByText("JavaScript URL in markup")).toBeVisible();
    await expect(page.locator("[data-release-summary]")).toContainText("2 errors");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("missing index and invalid public base are explicit errors", async ({ page }) => {
  const dir = fixture({ "about.html": html("About page", "") });
  try {
    await inspect(page, dir, "wrong");
    await expect(page.getByText("Invalid public base path")).toBeVisible();
    await page.locator("[data-release-base]").fill("/");
    await page.getByRole("button", { name: "Inspect build" }).click();
    await expect(page.getByText("Missing index.html")).toBeVisible();
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.locator("[data-release-results]")).toBeHidden();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("hostile HTML remains inert and selected remote image is never fetched", async ({ page }) => {
  const remote = [];
  page.on("request", request => {
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) remote.push(request.url());
  });
  const dir = fixture({ "index.html": html("Safe HTML", '<img src="https://example.invalid/attacker.png" onerror="window.__releaseXss=true"><script>window.__releaseXss=true</script>') });
  try {
    await inspect(page, dir);
    expect(await page.evaluate(() => window.__releaseXss)).toBeUndefined();
    expect(remote).toEqual([]);
    await expect(page.locator("[data-release-findings] script, [data-release-findings] img")).toHaveCount(0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("mobile layout, accessibility and disabled no-JS analysis", async ({ page, browser }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(url);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(scan.violations).toEqual([]);
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    await noJs.goto(url);
    await expect(noJs.getByText(/JavaScript is required to inspect selected files/)).toBeVisible();
    await expect(noJs.getByRole("button", { name: "Inspect build" })).toBeDisabled();
  } finally { await context.close(); }
});
