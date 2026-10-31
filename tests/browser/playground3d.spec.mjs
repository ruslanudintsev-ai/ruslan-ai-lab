import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const url = new URL("labs/3d/",root).toString();

async function optIn(page) {
  await page.getByRole("button",{name:"Enable 3D"}).click();
  await expect.poll(async()=>await page.locator("[data-3d-lab]").getAttribute("data-render-state")).not.toBe("static");
  await expect(page.locator("[data-3d-canvas]")).toBeVisible();
}

test("WebGL is never initialized until deliberate user opt-in",async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    window.__threeDcalls=0;
    HTMLCanvasElement.prototype.getContext=function(...args){
      if(args[0]==="webgl"||args[0]==="webgl2") window.__threeDcalls++;
      return original.apply(this,args);
    };
  });
  await page.goto(url);
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","static");
  await expect(page.locator("[data-3d-static]")).toBeVisible();
  await expect(page.locator("[data-3d-canvas]")).toBeHidden();
  await expect(page.getByRole("button",{name:"Enable 3D"})).toBeEnabled();
  await expect(page.getByLabel("Material color")).toBeDisabled();
  expect(await page.evaluate(()=>window.__threeDcalls)).toBe(0);
  await page.getByRole("button",{name:"Enable 3D"}).click();
  await expect.poll(async()=>await page.evaluate(()=>window.__threeDcalls)).toBeGreaterThan(0);
});

test("WebGL scene controls can opt in, play, pause and reset without external APIs",async({page})=>{
  await page.goto(url);
  await optIn(page);
  const scene=page.locator("[data-3d-lab]");
  await expect(scene).toHaveAttribute("data-render-state","paused");
  await page.getByLabel("Material color").selectOption("amber");
  await page.getByLabel("Light direction").selectOption("right");
  await page.getByLabel("Camera distance").selectOption("near");
  await expect(page.getByLabel("Material color")).toHaveValue("amber");
  await page.getByRole("button",{name:"Play rotation"}).click();
  await expect(scene).toHaveAttribute("data-render-state","running");
  await expect.poll(async()=>Number(await page.locator("[data-3d-canvas]").getAttribute("data-frame-count"))).toBeGreaterThan(2);
  await page.getByRole("button",{name:"Pause rotation"}).click();
  await expect(scene).toHaveAttribute("data-render-state","paused");
  const count=await page.locator("[data-3d-canvas]").getAttribute("data-frame-count");
  await page.waitForTimeout(140);
  await expect(page.locator("[data-3d-canvas]")).toHaveAttribute("data-frame-count",count);
  await page.getByRole("button",{name:"Reset scene"}).click();
  await expect(page.getByLabel("Material color")).toHaveValue("teal");
  await expect(page.getByLabel("Light direction")).toHaveValue("front");
  await expect(page.getByLabel("Camera distance")).toHaveValue("wide");
  await expect(scene).toHaveAttribute("data-render-state","paused");
});

test("keyboard alone controls the opt-in and bounded material options",async({page})=>{
  await page.goto(url);
  const enable=page.getByRole("button",{name:"Enable 3D"});
  await enable.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","paused");
  const material=page.getByLabel("Material color");
  await material.focus();
  await page.keyboard.press("End");
  await expect(material).toHaveValue("slate");
  const play=page.getByRole("button",{name:"Play rotation"});
  await play.focus();
  await page.keyboard.press("Space");
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","running");
  await page.keyboard.press("Space");
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","paused");
});

test("reduced motion begins paused, stops animation when preference changes",async({page})=>{
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto(url);
  await optIn(page);
  await expect(page.getByRole("status")).toContainText("reduced motion");
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","paused");
  await page.getByRole("button",{name:"Play rotation"}).click();
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","running");
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","paused");
});

test("hidden tab interrupts rotation and does not silently restart",async({page})=>{
  await page.goto(url);await optIn(page);
  await page.getByRole("button",{name:"Play rotation"}).click();
  await page.evaluate(()=>{
    Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","paused");
  await page.evaluate(()=>{
    Object.defineProperty(document,"hidden",{configurable:true,get:()=>false});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","paused");
});

test("unsupported WebGL preserves truthful static fallback without enabling fake controls",async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(...args){
      if(args[0]==="webgl") return null;
      return original.apply(this,args);
    };
  });
  await page.goto(url);
  await page.getByRole("button",{name:"Enable 3D"}).click();
  await expect(page.getByRole("status")).toContainText("unavailable");
  await expect(page.locator("[data-3d-static]")).toBeVisible();
  await expect(page.locator("[data-3d-canvas]")).toBeHidden();
  await expect(page.getByRole("button",{name:"Play rotation"})).toBeDisabled();
});

test("simulated GPU context loss restores static fallback without auto reenable",async({page})=>{
  await page.goto(url);await optIn(page);
  await page.locator("[data-3d-canvas]").evaluate(el=>el.dispatchEvent(new Event("webglcontextlost",{cancelable:true})));
  await expect(page.locator("[data-3d-static]")).toBeVisible();
  await expect(page.locator("[data-3d-lab]")).toHaveAttribute("data-render-state","static");
  await expect(page.getByRole("button",{name:"Play rotation"})).toBeDisabled();
});

test("JS-off illustration and explanations remain usable without false active buttons",async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  try {
    const page=await context.newPage();await page.goto(url);
    await expect(page.locator("[data-3d-static]")).toBeVisible();
    await expect(page.getByRole("button",{name:"Enable 3D"})).toBeDisabled();
    await expect(page.getByRole("button",{name:"Play rotation"})).toBeDisabled();
    await expect(page.getByText(/With JavaScript disabled or WebGL unsupported/)).toBeVisible();
  } finally { await context.close(); }
});

test("hi-DPR graphics resolution remains at most two backing pixels per CSS pixel",async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,"devicePixelRatio",{configurable:true,get:()=>5});});
  await page.goto(url);await optIn(page);
  const scale=await page.locator("[data-3d-canvas]").evaluate(el=>{
    const rect=el.getBoundingClientRect();return {w:el.width/rect.width,h:el.height/rect.height};
  });
  expect(scale.w).toBeLessThanOrEqual(2.05);
  expect(scale.h).toBeLessThanOrEqual(2.05);
});

test("no third-party requests from the opt-in GPU demo",async({page})=>{
  const remote=[];
  page.on("request",r=>{if(!["localhost","127.0.0.1"].includes(new URL(r.url()).hostname))remote.push(r.url());});
  await page.goto(url);
  await page.getByRole("button",{name:"Enable 3D"}).click();
  expect(remote).toEqual([]);
});

test("3D page stays accessible and overflow-free across five responsive widths",async({page},info)=>{
  for(const width of [320,360,390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(url);
    await expect(page.locator("[data-3d-static]")).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
    await page.screenshot({path:info.outputPath("3d-"+width+".png"),fullPage:true});
  }
  const audit=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
  expect(audit.violations).toEqual([]);
});
