import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: ["lab.spec.mjs", "canvas.spec.mjs", "workflow.spec.mjs"],
  timeout: 30_000,
  expect: { timeout: 8_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
});
