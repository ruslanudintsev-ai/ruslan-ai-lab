import { test, expect } from "@playwright/test";
const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const locationOf = path => new URL(path, root).toString();

test("home page's real lab and case links resolve under nested project path", async ({ page }, testInfo) => {
  await page.goto(root);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Engineering you can");
  await page.getByRole("link", { name: /Try CSS Studio/ }).click();
  await expect(page).toHaveURL(locationOf("labs/css-studio/"));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("CSS Studio");
  await expect(page.locator("[data-studio-code]")).toHaveValue(/--studio-accent: #146B67;/);
  if (testInfo.project.name === "webkit-iphone") {
    await page.screenshot({ path: testInfo.outputPath("webkit-iphone-css-studio.png"), fullPage: true });
  }
});

test("all five bounded controls and Reset work in the alternate browser", async ({ page }) => {
  await page.goto(locationOf("labs/css-studio/"));
  await expect(page.getByLabel("Accent color")).toBeEnabled();
  await page.getByLabel("Accent color").selectOption("#8054B2");
  await page.getByLabel("Corner radius").selectOption("24");
  await page.getByLabel("Grid columns").selectOption("3");
  await page.getByLabel("Grid gap").selectOption("32");
  await page.getByLabel("Animation").selectOption("subtle");
  const css = await page.locator("[data-studio-code]").inputValue();
  for (const term of ["--studio-accent: #8054B2;", "--studio-radius: 24px;", "--studio-columns: 3;", "--studio-gap: 32px;", "--studio-duration: 160ms;"]) {
    expect(css).toContain(term);
  }
  await expect(page.locator("[data-studio-preview]")).toHaveCSS("--studio-columns", "3");
  await page.getByRole("button", { name: "Reset tokens" }).click();
  await expect(page.getByLabel("Accent color")).toHaveValue("#146B67");
  await expect(page.locator("[data-studio-code]")).toHaveValue(/--studio-columns: 2;/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth + 1)
  );
});

test("no-JS candidate remains transparent and controls stay disabled", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await ctx.newPage();
    await page.goto(locationOf("labs/css-studio/"));
    await expect(page.getByText(/JavaScript is needed for the live preview/)).toBeVisible();
    await expect(page.getByLabel("Accent color")).toBeDisabled();
    await expect(page.getByRole("button", { name: /Copy generated CSS/ })).toBeDisabled();
  } finally {
    await ctx.close();
  }
});
