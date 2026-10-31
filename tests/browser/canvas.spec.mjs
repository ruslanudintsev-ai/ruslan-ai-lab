import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const url = new URL("labs/canvas/", root).toString();

test("homepage and header navigate to the real Canvas Lab under nested base", async ({ page }) => {
  await page.goto(root);
  await page.getByRole("link", { name: /Try Canvas Lab/ }).click();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Canvas Lab.");
  await page.getByRole("link", { name: "Lab home" }).click();
  await expect(page).toHaveURL(root);
  await page.getByRole("link", { name: "Canvas Lab", exact: true }).click();
  await expect(page).toHaveURL(url);
});

test("Canvas Lab starts paused, renders a canvas, and has bounded enabled controls", async ({ page }) => {
  await page.goto(url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Canvas Lab.");
  await expect(page.getByLabel("Particle count")).toBeEnabled();
  await expect(page.getByRole("button", { name: "Play simulation" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Reset to seed" })).toBeEnabled();
  await expect(page.locator("[data-canvas-static]")).toBeHidden();
  const canvas = page.locator("[data-canvas-stage]");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-simulation-state", "paused");
  await expect(canvas).toHaveAttribute("data-step-count", "0");
  const pixels = await canvas.evaluate(el => {
    if (!(el instanceof HTMLCanvasElement)) return false;
    const ctx = el.getContext("2d");
    if (!ctx) return false;
    return ctx.getImageData(Math.floor(el.width / 2), Math.floor(el.height / 2), 1, 1).data[3] > 0;
  });
  expect(pixels).toBe(true);
});

test("explicit Play runs simulation; Pause stops frame requests and Reset reproduces seed", async ({ page }) => {
  await page.goto(url);
  const canvas = page.locator("[data-canvas-stage]");
  const initial = await canvas.evaluate(el => el.toDataURL());
  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(canvas).toHaveAttribute("data-simulation-state", "running");
  await expect.poll(async () => Number(await canvas.getAttribute("data-step-count"))).toBeGreaterThan(3);
  await page.getByRole("button", { name: "Pause simulation" }).click();
  await expect(canvas).toHaveAttribute("data-simulation-state", "paused");
  const stoppedAt = await canvas.getAttribute("data-step-count");
  await page.waitForTimeout(150);
  await expect(canvas).toHaveAttribute("data-step-count", stoppedAt);
  await page.getByRole("button", { name: "Reset to seed" }).click();
  await expect(canvas).toHaveAttribute("data-step-count", "0");
  expect(await canvas.evaluate(el => el.toDataURL())).toBe(initial);
  await expect(page.getByRole("status")).toContainText("reset to seed 42");
});

test("changing count pauses and resets world without stale running state", async ({ page }) => {
  await page.goto(url);
  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-simulation-state", "running");
  await page.getByLabel("Particle count").selectOption("60");
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-simulation-state", "paused");
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-step-count", "0");
  await expect(page.getByRole("status")).toContainText("particle count updated");
  await expect(page.getByRole("button", { name: "Play simulation" })).toBeVisible();
});

test("reduced motion never autoplays and explicitly enables motion only by user choice", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  await expect(page.getByRole("status")).toContainText("reduced motion is preferred");
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-simulation-state", "paused");
  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-simulation-state", "running");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-simulation-state", "paused");
  await expect(page.getByRole("status")).toContainText("reduced-motion preference enabled");
});

test("hidden tab pauses and never silently resumes upon visibility", async ({ page }) => {
  await page.goto(url);
  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-simulation-state", "running");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-simulation-state", "paused");
  await expect(page.getByRole("status")).toContainText("tab hidden");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("[data-canvas-stage]")).toHaveAttribute("data-simulation-state", "paused");
});

test("pagehide cleans up animation and pageshow restores an explicitly paused, usable Canvas", async ({ page }) => {
  await page.goto(url);
  const stage = page.locator("[data-canvas-stage]");
  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(stage).toHaveAttribute("data-simulation-state", "running");
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await expect(stage).toHaveAttribute("data-simulation-state", "paused");
  await page.evaluate(() => window.dispatchEvent(new Event("pageshow")));
  await expect(page.getByRole("status")).toContainText("page restored");
  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(stage).toHaveAttribute("data-simulation-state", "running");
  await expect.poll(async () => Number(await stage.getAttribute("data-step-count"))).toBeGreaterThan(2);
});

test("no JavaScript shows truthful static fallback, not fake working controls", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(url);
    await expect(page.locator("[data-canvas-static]")).toBeVisible();
    await expect(page.locator("[data-canvas-stage]")).toBeHidden();
    await expect(page.getByLabel("Particle count")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Play simulation" })).toBeDisabled();
    await expect(page.getByText(/JavaScript and Canvas2D are needed/)).toBeVisible();
  } finally {
    await context.close();
  }
});

test("missing Canvas2D context keeps static fallback and never enables play", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = function () { return null; };
  });
  await page.goto(url);
  await expect(page.locator("[data-canvas-static]")).toBeVisible();
  await expect(page.locator("[data-canvas-stage]")).toBeHidden();
  await expect(page.getByRole("button", { name: "Play simulation" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Canvas2D unavailable");
});

test("Canvas Lab is responsive and accessibility scan passes at all key widths", async ({ page }, testInfo) => {
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url);
    await expect(page.locator("[data-canvas-stage]")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: testInfo.outputPath("canvas-" + width + ".png"), fullPage: true });
  }
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("Canvas Lab has no third-party network requests", async ({ page }) => {
  const remote = [];
  page.on("request", request => {
    const parsed = new URL(request.url());
    if (!["localhost", "127.0.0.1"].includes(parsed.hostname)) remote.push(parsed.toString());
  });
  await page.goto(url);
  await expect(page.getByRole("button", { name: "Play simulation" })).toBeEnabled();
  expect(remote).toEqual([]);
});
