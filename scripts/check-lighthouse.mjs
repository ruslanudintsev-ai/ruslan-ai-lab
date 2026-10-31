import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const file = process.argv[2];
assert.ok(file, "Lighthouse report path required");
const report = JSON.parse(readFileSync(file, "utf8"));
assert.match(report.finalUrl, /^http:\/\/127\.0\.0\.1:8769\/ruslan-ai-lab\//, "Audit must run on local nested compiled site");
assert.equal(report.lighthouseVersion.startsWith("13."), true, "Unexpected Lighthouse major version; inspect quality baseline");
const minimum = 90;
for (const id of ["performance", "accessibility", "best-practices", "seo"]) {
  const actual = Math.round((report.categories?.[id]?.score ?? -1) * 100);
  console.log("LIGHTHOUSE_LOCAL_MOBILE_" + id.toUpperCase().replace(/-/g, "_") + "=" + actual + "/100");
  assert.ok(actual >= minimum, id + " local mobile Lighthouse below " + minimum + "; inspect actual diagnostic details");
}
console.log("LIGHTHOUSE_LOCAL_MOBILE_PASS: static nested build, all categories >=90/100; SIMULATED lab only, not deployed Pages or field CWV");
