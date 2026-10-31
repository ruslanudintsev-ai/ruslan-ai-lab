import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const url = new URL("labs/workflow/", root).toString();
const shell = page => page.locator("[data-workflow]");

test("homepage and header link to a genuine local simulator", async ({ page }) => {
  await page.goto(root);
  await page.getByRole("link", { name: /Try Workflow Simulator/ }).click();
  await expect(page).toHaveURL(url);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("AI Workflow Simulator");
  await page.getByRole("link", { name: "Lab home" }).click();
  await expect(page).toHaveURL(root);
  await page.getByRole("link", { name: "Workflow", exact: true }).click();
  await expect(page).toHaveURL(url);
});

test("six educational steps and explicit CI and owner release gates", async ({ page }) => {
  await page.goto(url);
  await expect(shell(page)).toHaveAttribute("data-step", "issue");
  await expect(page.getByRole("list", { name: "Simulated workflow steps" }).getByRole("listitem")).toHaveCount(6);
  await expect(page.getByRole("button", { name: "Next step" })).toBeEnabled();
  const next = page.getByRole("button", { name: "Next step" });
  await next.click(); await expect(shell(page)).toHaveAttribute("data-step", "agent");
  await next.click(); await expect(shell(page)).toHaveAttribute("data-step", "pull-request");
  await next.click(); await expect(shell(page)).toHaveAttribute("data-step", "ci");
  await expect(next).toBeDisabled();
  await expect(page.getByRole("button", { name: "Simulate passed CI" })).toBeEnabled();
  await page.getByRole("button", { name: "Simulate passed CI" }).click();
  await expect(shell(page)).toHaveAttribute("data-ci", "passed");
  await next.click();
  await expect(shell(page)).toHaveAttribute("data-step", "review");
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "Simulate owner approval" }).click();
  await expect(shell(page)).toHaveAttribute("data-approved", "true");
  await next.click();
  await expect(shell(page)).toHaveAttribute("data-step", "release");
  await expect(page.getByRole("status")).toContainText("Nothing was published or merged");
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "Reset simulation" }).click();
  await expect(shell(page)).toHaveAttribute("data-step", "issue");
  await expect(shell(page)).toHaveAttribute("data-approved", "false");
});

test("failed CI forces a local revision and a fresh simulated result", async ({ page }) => {
  await page.goto(url);
  const next = page.getByRole("button", { name: "Next step" });
  for (let i = 0; i < 3; i++) await next.click();
  await page.getByRole("button", { name: "Simulate failed CI" }).click();
  await expect(page.getByRole("status")).toContainText("CI failed");
  await next.click();
  await expect(shell(page)).toHaveAttribute("data-step", "agent");
  await expect(shell(page)).toHaveAttribute("data-revision", "1");
  await next.click(); await next.click();
  await expect(shell(page)).toHaveAttribute("data-step", "ci");
  await expect(shell(page)).toHaveAttribute("data-ci", "pending");
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "Simulate passed CI" }).click();
  await next.click();
  await expect(shell(page)).toHaveAttribute("data-step", "review");
});

test("previous, next and reset operate using keyboard only", async ({ page }) => {
  await page.goto(url);
  const next = page.getByRole("button", { name: "Next step" });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(shell(page)).toHaveAttribute("data-step", "agent");
  const previous = page.getByRole("button", { name: "Previous step" });
  await previous.focus();
  await page.keyboard.press("Space");
  await expect(shell(page)).toHaveAttribute("data-step", "issue");
  await page.getByRole("button", { name: "Reset simulation" }).focus();
  await page.keyboard.press("Enter");
  await expect(shell(page)).toHaveAttribute("data-step", "issue");
});

test("no JavaScript shows truthful educational fallback and disabled controls", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(url);
    await expect(page.getByText(/JavaScript is needed to navigate/)).toBeVisible();
    await expect(page.getByRole("list", { name: "Simulated workflow steps" }).getByRole("listitem")).toHaveCount(6);
    await expect(page.getByRole("button", { name: "Next step" })).toBeDisabled();
    await expect(page.locator("[data-workflow]")).toHaveAttribute("data-step", "issue");
  } finally {
    await context.close();
  }
});

test("simulation is accessible, responsive and stores five viewport screenshots", async ({ page }, testInfo) => {
  for (const width of [320, 360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url);
    await expect(page.getByRole("button", { name: "Next step" })).toBeEnabled();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, "Workflow overflow at " + width).toBe(false);
    await page.screenshot({ path: testInfo.outputPath("workflow-" + width + ".png"), fullPage: true });
  }
  const results = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("simulation never requests third-party resources or external APIs", async ({ page }) => {
  const remote = [];
  page.on("request", request => {
    const host = new URL(request.url()).hostname;
    if (!["localhost", "127.0.0.1"].includes(host)) remote.push(request.url());
  });
  await page.goto(url);
  for (let i=0; i<3; i++) await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Simulate passed CI" }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("button", { name: "Simulate owner approval" }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  expect(remote).toEqual([]);
});
