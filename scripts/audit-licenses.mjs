/**
 * Inventory lockfile license metadata for release review.
 * This verifies metadata completeness, NOT redistribution rights or legal compliance.
 * No npm registry access, package execution, secrets or external services.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
const entries = Object.entries(lock.packages ?? {})
  .filter(([path]) => path.startsWith("node_modules/"))
  .map(([path, pkg]) => ({
    path,
    version: pkg.version ?? null,
    license: typeof pkg.license === "string" && pkg.license.trim() ? pkg.license.trim() : null
  }))
  .sort((a, b) => a.path.localeCompare(b.path));

const declared = { ...manifest.dependencies, ...manifest.devDependencies };
const direct = Object.entries(declared).sort(([a], [b]) => a.localeCompare(b)).map(([name, required]) => {
  const installed = lock.packages?.[`node_modules/${name}`];
  return { name, required, resolvedVersion: installed?.version ?? null, license: installed?.license ?? null };
});
const invalid = entries.filter(pkg => !pkg.license || !pkg.version);
const mismatches = direct.filter(pkg => !pkg.resolvedVersion || pkg.required !== pkg.resolvedVersion);
const lockRoot = lock.packages?.[""] ?? {};
if (JSON.stringify(lockRoot.dependencies ?? {}) !== JSON.stringify(manifest.dependencies ?? {}) ||
    JSON.stringify(lockRoot.devDependencies ?? {}) !== JSON.stringify(manifest.devDependencies ?? {})) {
  mismatches.push({ name: "(package.json vs lockfile root)", required: "matching dependency declarations", resolvedVersion: null });
}

const licenses = Object.fromEntries(
  [...new Set(entries.map(pkg => pkg.license ?? "MISSING"))].sort().map(license => [
    license,
    entries.filter(pkg => (pkg.license ?? "MISSING") === license).length
  ])
);
const reviewFlag = /(?:LGPL|MPL|FSL|BlueOak)/;
const report = {
  kind: "dependency-license-metadata-audit",
  sourceSha: process.env.SOURCE_SHA || null,
  notice: "License fields from the npm lockfile only. Not a license clearance, legal opinion, dependency notice bundle or proof of what is shipped in dist/.",
  lockfileVersion: lock.lockfileVersion,
  packageCount: entries.length,
  licenseCounts: licenses,
  directDependencies: direct,
  manualReviewCandidates: entries.filter(pkg => pkg.license && reviewFlag.test(pkg.license)),
  metadataProblems: invalid,
  manifestMismatches: mismatches
};
mkdirSync("quality-results", { recursive: true });
writeFileSync("quality-results/licenses-report.json", JSON.stringify(report, null, 2) + "\n");
console.log(`LICENSE_METADATA_INVENTORY: ${entries.length} entries, ${invalid.length} missing version/license, ${mismatches.length} manifest mismatches`);
console.log(`MANUAL_LICENSE_REVIEW_REQUIRED: ${report.manualReviewCandidates.length} entries with selected review flags; see JSON inventory`);
if (invalid.length || mismatches.length || !entries.length) {
  console.error("LICENSE_METADATA_INVENTORY_FAIL (no redistribution/legal-clearance claim)");
  process.exitCode = 1;
} else {
  console.log("LICENSE_METADATA_INVENTORY_PASS (metadata completeness only; owner release gate remains)");
}
