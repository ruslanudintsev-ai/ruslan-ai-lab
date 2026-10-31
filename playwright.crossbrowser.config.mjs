import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "crossbrowser.spec.mjs",
  outputDir: "./test-results-crossbrowser",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  projects: [
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-iphone", use: { ...devices["iPhone 13"] } }
  ],
  use: {
    baseURL: process.env.TEST_SITE_URL || "http://127.0.0.1:8769/ruslan-ai-lab/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
});
