import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const url = new URL("labs/browser-apis/", root).toString();
const board = page => page.locator("[data-board-list]");
const order = page => board(page).getAttribute("data-order");

test("homepage and header navigate to fifth real lab", async ({ page }) => {
  await page.goto(root);
  await page.getByRole("link", { name: "Try Browser APIs Lab" }).click();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Browser APIs Lab.");
  await page.getByRole("link", { name: "Lab home" }).click();
  await page.getByRole("link", { name: "Browser APIs", exact: true }).click();
  await expect(page).toHaveURL(url);
});

test("keyboard move controls reorder cards, reset is separate from storage", async ({ page }) => {
  await page.goto(url);
  await expect(board(page)).toHaveAttribute("data-order", "inspect,build,verify");
  const up = page.getByRole("button", { name: "Move Build up" });
  await up.focus();
  await page.keyboard.press("Enter");
  await expect(board(page)).toHaveAttribute("data-order", "build,inspect,verify");
  await expect(page.getByRole("status")).toContainText("Build moved up");
  await expect(page.getByRole("button", { name: "Move Build up" })).toBeDisabled();
  await page.getByRole("button", { name: "Reset board" }).click();
  await expect(board(page)).toHaveAttribute("data-order", "inspect,build,verify");
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test("save is opt-in, restored on reload and Clear removes only persisted copy", async ({ page }) => {
  await page.goto(url);
  const key = "ruslan-ai-lab:browser-apis:board:v1";
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBeNull();
  await page.getByRole("button", { name: "Move Verify up" }).click();
  await page.getByRole("button", { name: "Save to this browser" }).click();
  await expect(page.getByRole("status")).toContainText("Order saved");
  expect(JSON.parse(await page.evaluate(k => localStorage.getItem(k), key)).order).toEqual(["inspect", "verify", "build"]);
  await page.reload();
  await expect(board(page)).toHaveAttribute("data-order", "inspect,verify,build");
  await expect(page.getByRole("status")).toContainText("restored");
  await page.getByRole("button", { name: "Clear saved copy" }).click();
  await expect(board(page)).toHaveAttribute("data-order", "inspect,verify,build");
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBeNull();
  await page.reload();
  await expect(board(page)).toHaveAttribute("data-order", "inspect,build,verify");
});

test("corrupted saved data is rejected and storage blocking keeps reorder usable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { configurable: true, get() { throw new Error("blocked"); } });
  });
  await page.goto(url);
  await expect(page.getByRole("status")).toContainText("Storage access is blocked");
  await page.getByRole("button", { name: "Move Verify up" }).click();
  await expect(board(page)).toHaveAttribute("data-order", "inspect,verify,build");
  await page.getByRole("button", { name: "Save to this browser" }).click();
  await expect(page.getByRole("status")).toContainText("storage unavailable");
  await page.getByRole("button", { name: "Clear saved copy" }).click();
  await expect(page.getByRole("status")).toContainText("Could not confirm removal");
});

test("malformed persisted permutation cannot insert content or alter board", async ({ page }) => {
  await page.goto(url);
  await page.evaluate(() => localStorage.setItem("ruslan-ai-lab:browser-apis:board:v1", JSON.stringify({version:1,order:["inspect","inspect","<script>"]})));
  await page.reload();
  await expect(board(page)).toHaveAttribute("data-order", "inspect,build,verify");
  await expect(page.getByRole("status")).toContainText("Unrecognized saved data ignored");
});

test("native pointer drag moves card before target, button alternative remains", async ({ page }) => {
  await page.goto(url);
  await page.locator('[data-board-id="verify"]').dragTo(page.locator('[data-board-id="inspect"]'));
  await expect(board(page)).toHaveAttribute("data-order", "verify,inspect,build");
  await expect(page.getByRole("button", { name: "Move Verify down" })).toBeEnabled();
});

test("no-JS page keeps readable default and honestly disabled controls", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(url);
    await expect(page.getByText(/JavaScript is needed to reorder or save/)).toBeVisible();
    await expect(board(page).getByRole("listitem")).toHaveCount(3);
    await expect(page.getByRole("button", { name: "Save to this browser" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Move Build up" })).toBeDisabled();
  } finally { await context.close(); }
});

test("responsive, axe WCAG A/AA and no remote requests on browser lab", async ({ page }, testInfo) => {
  const remote = [];
  page.on("request", request => {
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) remote.push(request.url());
  });
  for (const width of [320,360,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto(url);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    await page.screenshot({ path: testInfo.outputPath("browser-apis-" + width + ".png"), fullPage: true });
  }
  const result = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(result.violations).toEqual([]);
  expect(remote).toEqual([]);
});
