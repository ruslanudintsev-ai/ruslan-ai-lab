import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const url = new URL("projects/", root).toString();

test("P6 projects index is linked from home, header and footer with correct base path", async ({ page }) => {
  await page.goto(root);
  await page.getByRole("link", { name: /Explore verified public projects/ }).click();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Projects with an evidence trail");
  await expect(page.locator(".project-directory-card")).toHaveCount(2);
  await page.getByRole("link", { name: "Lab home" }).click();
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await expect(page).toHaveURL(url);
});

test("P6 distinguishes public source, CI and verified site publication, without inventing Opalubka live release", async ({ page }) => {
  await page.goto(url);
  const cards = page.locator(".project-directory-card");
  await expect(cards.first().getByRole("heading", { level: 3 })).toHaveText("Ruslan AI Lab");
  await expect(cards.last().getByRole("heading", { level: 3 })).toHaveText("Opalubka / LAB");
  await expect(cards.first().getByRole("link", { name: /P4 release evidence/ }))
    .toHaveAttribute("href", "https://github.com/ruslanudintsev-ai/ruslan-ai-lab/actions/runs/41192989794");
  await expect(cards.last()).toContainText("No independently verified public site release");
  await expect(cards.last()).toContainText("not an operating equipment-rental company");
  await expect(cards.last().getByRole("link", { name: /Astro implementation PR/ }))
    .toHaveAttribute("href", "https://github.com/ruslanudintsev-ai/opalubka/pull/5");
  await expect(cards.first().getByRole("link", { name: /Release case study/ }))
    .toHaveAttribute("href", "/ruslan-ai-lab/case-studies/release-gates/");
});

test("P6 public index does not ship private repository identifiers or third-party resources", async ({ page }) => {
  const remote = [];
  page.on("request", req => {
    if (!["127.0.0.1", "localhost"].includes(new URL(req.url()).hostname)) remote.push(req.url());
  });
  await page.goto(url);
  const externalLinks = await page.locator("main a[href^='https://']").evaluateAll(links => links.map(link => link.getAttribute("href")));
  const permittedPrefixes = [
    "https://github.com/ruslanudintsev-ai/ruslan-ai-lab",
    "https://github.com/ruslanudintsev-ai/opalubka"
  ];
  for (const href of externalLinks) {
    expect(permittedPrefixes.some(prefix => href === prefix || href?.startsWith(prefix + "/")), "P6 external link outside approved public evidence: " + href).toBe(true);
  }
  expect(remote).toEqual([]);
});

test("P6 remains readable with scripts disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(url);
    await expect(page.locator(".project-directory-card")).toHaveCount(2);
    await expect(page.getByRole("link", { name: /Inspect source/ })).toHaveCount(2);
  } finally {
    await context.close();
  }
});

test("P6 project directory passes five responsive viewport and accessibility checks", async ({ page }, testInfo) => {
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url);
    await expect(page.locator(".project-directory-card")).toHaveCount(2);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, "projects index overflow at " + width).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: testInfo.outputPath("p6-projects-" + width + ".png"), fullPage: true });
  }
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(axe.violations).toEqual([]);
});
