import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const url = new URL("tools/seo-inspector/", root).toString();
const good = `<!doctype html><html lang="en"><head>
<title>Practical HTML auditing for accessible small sites</title>
<meta name="description" content="Inspect the source locally and review common on-page SEO signals.">
<link rel="canonical" href="https://example.org/page">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>
</head><body><h1>HTML audit</h1><h2>Overview</h2>
<a href="/about">About the project</a><img src="/example.jpg" alt="Sample illustration">
</body></html>`;

test("homepage link and HTML source checks work without a backend", async ({ page }) => {
  await page.goto(root);
  await page.getByRole("link", { name: "SEO Inspector" }).first().click();
  await expect(page).toHaveURL(url);
  await page.locator("[data-seo-input]").fill(good);
  await page.getByRole("button", { name: "Analyze HTML" }).click();
  await expect(page.locator("[data-seo-output]")).toBeVisible();
  await expect(page.getByText("Title present")).toBeVisible();
  await expect(page.getByText("JSON-LD syntax", { exact: true })).toBeVisible();
  await expect(page.locator("[data-level=error]")).toHaveCount(0);
  await expect(page.locator("[data-seo-summary]")).toContainText("no ranking prediction");
});

test("missing title, noindex, empty links, missing alt and invalid JSON-LD are reported", async ({ page }) => {
  await page.goto(url);
  await page.locator("[data-seo-input]").fill(`<html><head>
<meta name="robots" content="noindex,follow">
<script type="application/ld+json">{"broken":</script>
</head><body><h2>Skip H1</h2><img src="/photo.png"><a href="/empty"></a></body></html>`);
  await page.getByRole("button", { name: "Analyze HTML" }).click();
  for (const name of ["Missing document title", "Noindex detected", "H1 structure", "Images missing alt attributes", "Links without an accessible name", "Invalid JSON-LD syntax"]) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
});

test("chosen file loads locally and Clear removes input and report", async ({ page }) => {
  await page.goto(url);
  await page.locator("[data-seo-file]").setInputFiles({ name: "example.html", mimeType: "text/html", buffer: Buffer.from(good) });
  await expect(page.getByRole("status")).toContainText("Loaded example.html locally");
  await page.getByRole("button", { name: "Analyze HTML" }).click();
  await expect(page.locator("[data-seo-output]")).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.locator("[data-seo-input]")).toHaveValue("");
  await expect(page.locator("[data-seo-output]")).toBeHidden();
});

test("hostile markup neither runs nor triggers outbound resource loads", async ({ page }) => {
  const remote = [];
  page.on("request", request => {
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) remote.push(request.url());
  });
  await page.goto(url);
  await page.locator("[data-seo-input]").fill(`<html lang="en"><head><title>Safety check with hostile HTML</title></head>
<body><h1>Safe</h1><img src="https://example.invalid/evil.png" onerror="window.__injected=true">
<script>window.__injected=true</script><a href="javascript:alert(1)">Link</a></body></html>`);
  await page.getByRole("button", { name: "Analyze HTML" }).click();
  await expect(page.locator("[data-seo-output]")).toBeVisible();
  expect(await page.evaluate(() => window.__injected)).toBeUndefined();
  expect(remote).toEqual([]);
  await expect(page.locator("[data-seo-results] script")).toHaveCount(0);
});

test("mobile layout, accessible controls and no-JS explanation", async ({ page, browser }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(url);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
  const violations = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(violations.violations).toEqual([]);
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const noJs = await context.newPage();
    await noJs.goto(url);
    await expect(noJs.getByText(/Enable JavaScript to run the local analysis/)).toBeVisible();
  } finally { await context.close(); }
});
