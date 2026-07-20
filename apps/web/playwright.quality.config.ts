import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/quality",
  fullyParallel: true,
  forbidOnly: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  use: {
    baseURL: "http://127.0.0.1:3216",
    colorScheme: "light",
    locale: "en-US",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "USER_MANUAL_ENABLE_DEV_PREVIEW=1 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3216 corepack pnpm build && USER_MANUAL_ENABLE_DEV_PREVIEW=1 corepack pnpm start --hostname 127.0.0.1 --port 3216",
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://127.0.0.1:3216/welcome",
  },
});
