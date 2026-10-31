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

test("Canvas Lab renders and respects explicit Play, Pause, Reset in alternate browsers", async ({ page }, testInfo) => {
  await page.goto(locationOf("labs/canvas/"));
  const stage = page.locator("[data-canvas-stage]");
  await expect(stage).toBeVisible();
  await expect(stage).toHaveAttribute("data-simulation-state", "paused");
  await page.getByRole("button", { name: "Play simulation" }).click();
  await expect(stage).toHaveAttribute("data-simulation-state", "running");
  await expect.poll(async () => Number(await stage.getAttribute("data-step-count"))).toBeGreaterThan(2);
  await page.getByRole("button", { name: "Pause simulation" }).click();
  await expect(stage).toHaveAttribute("data-simulation-state", "paused");
  await page.getByRole("button", { name: "Reset to seed" }).click();
  await expect(stage).toHaveAttribute("data-step-count", "0");
  if (testInfo.project.name === "webkit-iphone") {
    await page.screenshot({ path: testInfo.outputPath("webkit-iphone-canvas-lab.png"), fullPage: true });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth + 1)
  );
});

test("Canvas Lab without scripts remains a true static fallback across engines", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(locationOf("labs/canvas/"));
    await expect(page.locator("[data-canvas-static]")).toBeVisible();
    await expect(page.locator("[data-canvas-stage]")).toBeHidden();
    await expect(page.getByRole("button", { name: "Play simulation" })).toBeDisabled();
  } finally {
    await context.close();
  }
});

test("3D Playground has an opt-in GPU path or honest fallback on alternate browsers",async({page},info)=>{
  await page.goto(locationOf("labs/3d/"));
  await expect(page.locator("[data-3d-static]")).toBeVisible();
  await expect(page.locator("[data-3d-canvas]")).toBeHidden();
  await page.getByRole("button",{name:"Enable 3D"}).click();
  const state=page.locator("[data-3d-lab]");
  await expect.poll(async()=>await page.getByRole("status").textContent()).toMatch(/enabled|unavailable|failed/i);
  if(await state.getAttribute("data-render-state")==="static"){
    await expect(page.locator("[data-3d-static]")).toBeVisible();
    await expect(page.getByRole("button",{name:"Play rotation"})).toBeDisabled();
  } else {
    await expect(page.locator("[data-3d-canvas]")).toBeVisible();
    await expect(page.getByRole("button",{name:"Play rotation"})).toBeEnabled();
    await expect(state).toHaveAttribute("data-render-state","paused");
    // A running GPU context isn't enough: WebKit must retain a visible frame
    // while paused, rather than presenting an all-black canvas.
    const pixel=await page.locator("[data-3d-canvas]").evaluate(canvas=>{
      const context=canvas.getContext("webgl");
      if (!context) return null;
      const bytes=new Uint8Array(4);
      context.readPixels(Math.floor(canvas.width/2),Math.floor(canvas.height/2),1,1,context.RGBA,context.UNSIGNED_BYTE,bytes);
      return [...bytes];
    });
    expect(pixel,"enabled WebGL scene must have readable framebuffer pixels").not.toBeNull();
    expect(Math.max(...pixel.slice(0,3)),"WebGL canvas must not be black while paused").toBeGreaterThan(25);
  }
  if(info.project.name==="webkit-iphone") await page.screenshot({path:info.outputPath("webkit-iphone-3d.png"),fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(()=>window.innerWidth+1)
  );
});

test("3D static fallback is available with JavaScript disabled in alternate browsers",async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  try{
    const page=await context.newPage();await page.goto(locationOf("labs/3d/"));
    await expect(page.locator("[data-3d-static]")).toBeVisible();
    await expect(page.getByRole("button",{name:"Enable 3D"})).toBeDisabled();
    await expect(page.getByRole("button",{name:"Play rotation"})).toBeDisabled();
  } finally {await context.close();}
});

test("Workflow Simulator stays local and enforces owner approval in alternate engines", async ({ page }, testInfo) => {
  await page.goto(locationOf("labs/workflow/"));
  const surface = page.locator("[data-workflow]");
  const next = page.getByRole("button", { name: "Next step" });
  await expect(surface).toHaveAttribute("data-step", "issue");
  for (let i = 0; i < 3; i++) await next.click();
  await expect(surface).toHaveAttribute("data-step", "ci");
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "Simulate passed CI" }).click();
  await next.click();
  await expect(surface).toHaveAttribute("data-step", "review");
  await expect(next).toBeDisabled();
  await page.getByRole("button", { name: "Simulate owner approval" }).click();
  await next.click();
  await expect(surface).toHaveAttribute("data-step", "release");
  if (testInfo.project.name === "webkit-iphone") {
    await page.screenshot({ path: testInfo.outputPath("webkit-iphone-workflow.png"), fullPage: true });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth + 1)
  );
});

test("Workflow Simulator JS-off fallback is genuinely inactive in alternate engines", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await ctx.newPage();
    await page.goto(locationOf("labs/workflow/"));
    await expect(page.getByText(/JavaScript is needed to navigate/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Next step" })).toBeDisabled();
    await expect(page.getByRole("list", { name: "Simulated workflow steps" }).getByRole("listitem")).toHaveCount(6);
  } finally {
    await ctx.close();
  }
});
