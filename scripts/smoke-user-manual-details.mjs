#!/usr/bin/env node

const baseUrl = (process.env.USER_MANUAL_BASE_URL || "http://127.0.0.1:3200")
  .replace(/\/+$/, "");

if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(baseUrl)) {
  throw new Error("Detail preview smoke checks only run against localhost.");
}

const routes = [
  ...Array.from({ length: 6 }, (_, index) => `/levels/${index + 1}`),
  "/universes/wake-the-fck-up",
  "/universes/prana-fusion",
  "/universes/yoga-reset",
  "/universes/gravity-yoga",
  "/universes/here-to-there",
];

const fullPreview = "um_dev_auth=1; um_dev_premium=1; um_dev_progress=all";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function read(path, cookie = "") {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      accept: "text/html",
      ...(cookie ? { cookie } : {}),
    },
    redirect: "manual",
  });
  return {
    elapsed: performance.now() - started,
    response,
    text: await response.text(),
  };
}

async function check(name, callback) {
  try {
    await callback();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(`  ${error.message}`);
    process.exitCode = 1;
  }
}

console.log(`User Manual detail smoke test: ${baseUrl}`);

await read("/universes/prana-fusion", fullPreview);

await check("all six levels and five paid worlds render", async () => {
  const results = await Promise.all(
    routes.map(async (route) => ({ route, ...(await read(route, fullPreview)) })),
  );
  const failed = results.filter(({ response }) => response.status !== 200);
  assert(
    failed.length === 0,
    failed.map(({ route, response }) => `${route}: ${response.status}`).join(", "),
  );
});

await check("paid world distinguishes account, purchase, progression, and Coming Soon states", async () => {
  const [account, purchase, progression, comingSoon] = await Promise.all([
    read("/universes/prana-fusion"),
    read("/universes/prana-fusion", "um_dev_auth=1; um_dev_progress=all"),
    read(
      "/universes/gravity-yoga",
      "um_dev_auth=1; um_dev_premium=1; um_dev_progress=half",
    ),
    read("/universes/prana-fusion?preview=coming-soon", fullPreview),
  ]);
  assert(account.text.includes("Account required"), "missing account-required state");
  assert(purchase.text.includes("Lifetime access required"), "missing purchase-required state");
  assert(progression.text.includes("Progression locked"), "missing progression lock state");
  assert(comingSoon.text.includes("Coming soon"), "missing Coming Soon state");
});

await check("available detail routes expose their core page structure", async () => {
  const [level, universe] = await Promise.all([
    read("/levels/1", fullPreview),
    read("/universes/prana-fusion", fullPreview),
  ]);
  for (const result of [level, universe]) {
    assert(result.text.includes("Core film"), "missing core film chapter");
    assert(result.text.includes("Practice this"), "missing associated practices section");
    assert(
      result.text.includes("Master checklist") || result.text.includes("Mastery Checklist"),
      "missing checklist section",
    );
  }
  assert(
    /Complete level/i.test(level.text),
    "missing level completion control",
  );
  assert(
    universe.text.includes("Mark incomplete") || universe.text.includes("Complete tutorial"),
    "missing paid tutorial completion control",
  );
});

await check("development preview avoids remote-data timeout stalls", async () => {
  const { elapsed } = await read("/universes/prana-fusion", fullPreview);
  assert(elapsed < 2_500, `preview took ${Math.round(elapsed)}ms`);
});

await check("practice media remains protected server-side", async () => {
  const { response, text } = await read(
    "/api/practices/00000000-0000-0000-0000-000000000000/media",
  );
  assert(response.status === 401, `expected 401, got ${response.status}`);
  assert(text.includes("Authentication required"), "unexpected media error body");
});

if (!process.exitCode) {
  console.log("All detail smoke checks passed.");
}
