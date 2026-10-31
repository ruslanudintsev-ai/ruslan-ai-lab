import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const root = process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/";
const url = path => new URL(path, root).toString();
const cases = [
  { slug:"webkit-frame", heading:/A green test was not a visible frame/, link:"Read WebKit case", proof:"41182540844" },
  { slug:"release-gates", heading:/From specification to a controlled release/, link:"Read release case", proof:"41192989794" }
];

test("homepage has three truthful accessible case links and grounded positioning",async({page})=>{
  await page.goto(root);
  await expect(page.locator(".evidence-section .case-row")).toHaveCount(3);
  await expect(page.getByRole("link",{name:/Read Opalubka case/})).toHaveAttribute("href","/ruslan-ai-lab/case-studies/opalubka/");
  for(const item of cases){
    const target=url("case-studies/"+item.slug+"/");
    await expect(page.getByRole("link",{name:item.link})).toHaveAttribute("href",new URL(target).pathname);
  }
  await expect(page.getByText("I define scope, coordinate AI-assisted implementation")).toBeVisible();
  await expect(page.getByRole("link",{name:/See the public GitHub profile/})).toHaveAttribute("href","https://github.com/ruslanudintsev-ai");
});

for(const item of cases){
  test(item.slug+" links original evidence and can return to homepage",async({page})=>{
    await page.goto(root);
    await page.getByRole("link",{name:item.link}).click();
    await expect(page).toHaveURL(url("case-studies/"+item.slug+"/"));
    await expect(page.getByRole("heading",{level:1})).toContainText(item.heading);
    await expect(page.getByRole("complementary",{name:/Verifiable/})).toBeVisible();
    await expect(page.locator(".evidence-aside a[href*='"+item.proof+"']")).toHaveCount(1);
    const links=await page.locator(".evidence-aside a").evaluateAll(list=>list.map(a=>a.getAttribute("href")));
    expect(links.length).toBeGreaterThan(4);
    expect(links.filter(h=>h?.startsWith("https://")).every(h=>new URL(h).hostname==="github.com")).toBe(true);
    await page.getByRole("link",{name:"Lab home"}).click();
    await expect(page).toHaveURL(root);
  });

  test(item.slug+" has visible mobile layouts, five screenshot proofs and no overflow",async({page},info)=>{
    for(const width of [320,360,390,768,1440]){
      await page.setViewportSize({width,height:900});
      await page.goto(url("case-studies/"+item.slug+"/"));
      await expect(page.getByRole("heading",{level:1})).toBeVisible();
      await expect(page.locator(".evidence-aside")).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth),item.slug+" overflow at "+width).toBeLessThanOrEqual(width+1);
      await page.screenshot({path:info.outputPath("p5-"+item.slug+"-"+width+".png"),fullPage:true});
    }
  });

  test(item.slug+" passes automated accessibility and keeps evidence without JS",async({page,browser})=>{
    await page.goto(url("case-studies/"+item.slug+"/"));
    const results=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
    expect(results.violations,item.slug+" axe violations").toEqual([]);
    const context=await browser.newContext({javaScriptEnabled:false});
    try{
      const p=await context.newPage();
      await p.goto(url("case-studies/"+item.slug+"/"));
      await expect(p.getByRole("heading",{level:1})).toContainText(item.heading);
      await expect(p.locator(".evidence-aside a").first()).toBeVisible();
    }finally{await context.close()}
  });
}
