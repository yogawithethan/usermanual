import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    colorScheme: "light",
    locale: "en-US",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    },
  },
  webServer: {
    command: "NEXT_PUBLIC_SITE_URL=http://localhost:3100 corepack pnpm build && corepack pnpm start --port 3100",
    url: "http://localhost:3100/ui-lab",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
