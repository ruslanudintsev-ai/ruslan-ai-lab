import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const locationOf = (path = "") => new URL(path, root).toString();

test("homepage has real functional lab, truthful planned cards and source links", async ({ page }) => {
  await page.goto(root);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Engineering you can");
  await expect(page.getByRole("link", { name: /Try CSS Studio/i })).toBeVisible();
  await expect(page.getByText("Not available yet")).toHaveCount(2);
  await expect(page.getByRole("link", { name: /Try Canvas Lab/ })).toHaveAttribute("href", "/ruslan-ai-lab/labs/canvas/");
  await expect(page.getByRole("link", { name: /Read Opalubka case/i })).toHaveAttribute("href", /case-studies\/opalubka\//);
  await page.getByRole("link", { name: /Try CSS Studio/i }).click();
  await expect(page).toHaveURL(locationOf("labs/css-studio/"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("CSS Studio.");
});

test("engineering method is visible, evidence-backed and reachable from nested routes", async ({ page }) => {
  await page.goto(root);
  const method = page.getByRole("region", { name: "How the work gets verified." });
  await expect(method).toBeVisible();
  await expect(method.getByRole("listitem")).toHaveCount(3);
  await expect(method.getByRole("heading", { level: 3 })).toHaveCount(3);
  await expect(method.getByText(/not a connected agent dashboard/i)).toBeVisible();
  await expect(method.getByRole("link", { name: /Read the P0 specification/i })).toHaveAttribute("href", /ruslan-ai-lab\/pull\/1$/);
  await expect(method.getByRole("link", { name: /Inspect a real CI run/i })).toHaveAttribute("href", /41176807380$/);
  await expect(method.getByRole("link", { name: /Follow the reviewed MVP/i })).toHaveAttribute("href", /ruslan-ai-lab\/pull\/2$/);

  await page.goto(locationOf("case-studies/opalubka/"));
  await page.getByRole("link", { name: "Our method" }).click();
  await expect(page).toHaveURL(new URL("#method", root).toString());
  await expect(page.locator("#method")).toBeInViewport();
});

test("bounded token controls update preview and displayed CSS; reset restores defaults", async ({ page }) => {
  await page.goto(locationOf("labs/css-studio/"));
  const accent = page.getByLabel("Accent color");
  const radius = page.getByLabel("Corner radius");
  const columns = page.getByLabel("Grid columns");
  const gap = page.getByLabel("Grid gap");
  const motion = page.getByLabel("Animation");
  const code = page.locator("[data-studio-code]");
  const preview = page.locator("[data-studio-preview]");

  await accent.selectOption("#8054B2");
  await radius.selectOption("24");
  await columns.selectOption("3");
  await gap.selectOption("32");
  await motion.selectOption("subtle");
  const updated = await code.inputValue();
  expect(updated).toContain("--studio-accent: #8054B2;");
  expect(updated).toContain("--studio-radius: 24px;");
  expect(updated).toContain("--studio-columns: 3;");
  expect(updated).toContain("--studio-gap: 32px;");
  expect(updated).toContain("--studio-duration: 160ms;");
  await expect(preview).toHaveCSS("--studio-accent", "#8054B2");
  await expect(preview).toHaveCSS("--studio-radius", "24px");

  await page.getByRole("button", { name: "Reset tokens" }).click();
  const restored = await code.inputValue();
  expect(restored).toContain("--studio-accent: #146B67;");
  expect(restored).toContain("--studio-columns: 2;");
  expect(restored).toContain("--studio-duration: 0ms;");
  await expect(accent).toHaveValue("#146B67");
});

test("clipboard unavailable falls back to genuinely selectable generated text", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
  await page.goto(locationOf("labs/css-studio/"));
  await page.getByRole("button", { name: /Copy generated CSS/ }).click();
  await expect(page.getByRole("status")).toContainText("Clipboard unavailable");
  const code = page.locator("[data-studio-code]");
  await expect(code).toBeFocused();
  const selection = await code.evaluate(element => {
    if (!(element instanceof HTMLTextAreaElement)) throw new Error("Generated code is not a textarea");
    return element.value.slice(element.selectionStart, element.selectionEnd);
  });
  expect(selection).toContain("--studio-accent: #146B67;");
});

test("case study links to real source without falsely promising live telemetry", async ({ page }) => {
  await page.goto(locationOf("case-studies/opalubka/"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Opalubka.");
  await expect(page.getByRole("link", { name: /GitHub Actions build \+ deploy/ })).toHaveAttribute("href", /41100450242/);
  await expect(page.getByText(/ongoing uptime/)).toBeVisible();
});

test("no horizontal overflow on homepage and CSS Studio; five screenshots", async ({ page }, testInfo) => {
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, label] of [["", "home"], ["labs/css-studio/", "studio"]]) {
      await page.goto(locationOf(route));
      await expect(page.locator("main")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow, label + " overflow at " + width).toBe(false);
      await page.screenshot({ path: testInfo.outputPath(label + "-" + width + ".png"), fullPage: true });
    }
  }
});

test("axe baseline on homepage and functional lab", async ({ page }) => {
  for (const route of ["", "labs/css-studio/", "case-studies/opalubka/"]) {
    await page.goto(locationOf(route));
    const results = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
    expect(results.violations, route + " axe violations").toEqual([]);
  }
});

test("core navigation works using the keyboard only", async ({ page }) => {
  await page.goto(root);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await page.goto(locationOf("labs/css-studio/"));
  await page.getByLabel("Accent color").focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Corner radius")).toBeFocused();
});

test("static content stays honest when scripts are disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(locationOf("labs/css-studio/"));
  await expect(page.getByText(/JavaScript is needed for the live preview/)).toBeVisible();
  await expect(page.getByLabel("Accent color")).toBeDisabled();
  await expect(page.getByLabel("Grid columns")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Reset tokens" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Copy generated CSS/ })).toBeDisabled();
  await expect(page.locator("[data-studio-code]")).toContainText("--studio-accent: #146B67;");
  await context.close();
});

test("progressive enhancement makes controls genuinely usable after hydration", async ({ page }) => {
  await page.goto(locationOf("labs/css-studio/"));
  await expect(page.getByLabel("Accent color")).toBeEnabled();
  await expect(page.getByLabel("Grid columns")).toBeEnabled();
  await expect(page.getByRole("button", { name: "Reset tokens" })).toBeEnabled();
  await expect(page.getByRole("button", { name: /Copy generated CSS/ })).toBeEnabled();
  await expect(page.locator("[data-studio-help]")).toBeHidden();
});

test("three-column 320px scenario remains contained and readable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(locationOf("labs/css-studio/"));
  await page.getByLabel("Grid columns").selectOption("3");
  await page.getByLabel("Grid gap").selectOption("32");
  await page.getByLabel("Corner radius").selectOption("24");
  await expect(page.locator("[data-studio-code]")).toHaveValue(/--studio-columns: 3;/);
  const measurements = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    tileCount: document.querySelectorAll(".demo-preview__tile").length,
    overflowTiles: Array.from(document.querySelectorAll(".demo-preview__tile")).filter(tile =>
      tile.scrollWidth > tile.clientWidth + 1
    ).length
  }));
  expect(measurements.tileCount).toBe(3);
  expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.width + 1);
  expect(measurements.overflowTiles).toBe(0);
});

test("site load makes no remote third-party requests", async ({ page }) => {
  const requests = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if (!["127.0.0.1","localhost"].includes(url.hostname)) requests.push(request.url());
  });
  for (const route of ["", "labs/css-studio/", "case-studies/opalubka/"]) {
    await page.goto(locationOf(route));
    await expect(page.locator("main")).toBeVisible();
  }
  expect(requests).toEqual([]);
});

test("copy button puts exactly displayed generated CSS onto actual clipboard", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(root).origin });
  await page.goto(locationOf("labs/css-studio/"));
  await page.getByLabel("Accent color").selectOption("#B44C38");
  const displayed = await page.locator("[data-studio-code]").inputValue();
  await page.getByRole("button", { name: /Copy generated CSS/ }).click();
  await expect(page.getByRole("status")).toContainText("CSS copied to clipboard.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(displayed);
});

test("system prefers reduced motion takes precedence over CSS Studio animation choice", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(locationOf("labs/css-studio/"));
  await page.getByLabel("Animation").selectOption("subtle");
  await expect(page.locator("[data-studio-code]")).toHaveValue(/prefers-reduced-motion: reduce/);
  const effective = await page.locator(".demo-preview__tile").first().evaluate(el => {
    const computed = getComputedStyle(el);
    return {
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      duration: computed.transitionDuration
    };
  });
  expect(effective.reduced).toBe(true);
  expect(effective.duration.split(",").every(time => Number.parseFloat(time) <= 0.001)).toBe(true);
});
