import { chromium } from "@playwright/test";

const baseUrl = process.env.USER_MANUAL_BASE_URL || "http://127.0.0.1:3217";
const routes = [
  "/",
  "/welcome",
  "/levels/1",
  "/paid",
  "/universes/wake-the-fck-up",
  "/terms",
  "/privacy",
  "/refunds",
];
const budgets = {
  loadMs: 2500,
  firstContentfulPaintMs: 1800,
  cumulativeLayoutShift: 0.1,
  javascriptBytes: 650_000,
  totalBytes: 5_000_000,
};

const browser = await chromium.launch();
const failures = [];
const results = [];

try {
  for (const route of routes) {
    const context = await browser.newContext({
      colorScheme: "light",
      locale: "en-US",
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.__userManualLayoutShift = 0;
      window.__userManualLayoutShiftSources = [];
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__userManualLayoutShift += entry.value;
            window.__userManualLayoutShiftSources.push({
              value: Number(entry.value.toFixed(4)),
              sources: entry.sources.map((source) => ({
                currentRect: source.currentRect,
                node: source.node instanceof Element
                  ? `${source.node.tagName.toLowerCase()}${source.node.id ? `#${source.node.id}` : ""}${source.node.classList.length ? `.${[...source.node.classList].slice(0, 3).join(".")}` : ""}`
                  : "unknown",
                previousRect: source.previousRect,
              })),
            });
          }
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    if (!response?.ok()) failures.push(`${route}: HTTP ${response?.status() ?? "no response"}`);

    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      const firstContentfulPaint = performance
        .getEntriesByType("paint")
        .find((entry) => entry.name === "first-contentful-paint");
      const javascriptBytes = resources
        .filter((entry) => entry.initiatorType === "script")
        .reduce((total, entry) => total + entry.transferSize, 0);
      const totalBytes = resources.reduce((total, entry) => total + entry.transferSize, 0);

      return {
        loadMs: Math.round(navigation.duration),
        firstContentfulPaintMs: Math.round(firstContentfulPaint?.startTime ?? 0),
        cumulativeLayoutShift: Number(window.__userManualLayoutShift.toFixed(4)),
        layoutShiftSources: window.__userManualLayoutShiftSources,
        javascriptBytes,
        totalBytes,
      };
    });

    for (const [metric, budget] of Object.entries(budgets)) {
      if (metrics[metric] > budget) {
        failures.push(`${route}: ${metric} ${metrics[metric]} exceeds ${budget}`);
      }
    }

    results.push({ route, ...metrics });
    await context.close();
  }
} finally {
  await browser.close();
}

console.table(results);
if (failures.length) {
  for (const result of results.filter((item) => item.cumulativeLayoutShift > budgets.cumulativeLayoutShift)) {
    console.error(`${result.route} layout-shift sources: ${JSON.stringify(result.layoutShiftSources)}`);
  }
  console.error(`User Manual production performance gate failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("User Manual production performance gate passed.");
