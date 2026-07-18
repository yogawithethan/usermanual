#!/usr/bin/env node

const baseUrl = (process.env.USER_MANUAL_BASE_URL || "https://tutorial.yogawithethan.com")
  .replace(/\/+$/, "");
const authCookie = process.env.USER_MANUAL_COOKIE || "";

const checks = [];
const authenticatedChecks = [];

function addCheck(name, fn) {
  checks.push({ fn, name });
}

function addAuthenticatedCheck(name, fn) {
  authenticatedChecks.push({ fn, name });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, init = {}, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...init,
    headers: {
      accept: "application/json",
      ...(options.auth && authCookie ? { cookie: authCookie } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let json = null;

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      // Some checks only need status/headers.
    }
  }

  return { json, response, text };
}

addCheck("manifest GET returns published content", async () => {
  const { json, response } = await request("/api/content/manifest");

  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(json?.schemaVersion === 1, "manifest schemaVersion must be 1");
  assert(json?.product?.slug === "the-user-manual", "manifest product slug mismatch");
  assert(Array.isArray(json?.levels) && json.levels.length >= 1, "manifest must include levels");
  assert(
    Array.isArray(json?.practiceUniverses) && json.practiceUniverses.length >= 1,
    "manifest must include practice universes",
  );
  assert(typeof json?.contentVersion === "string", "manifest must include contentVersion");
});

addCheck("manifest HEAD exposes cache validators", async () => {
  const { response } = await request("/api/content/manifest", { method: "HEAD" });
  const etag = response.headers.get("etag");
  const contentVersion = response.headers.get("x-content-version");

  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(Boolean(etag), "manifest HEAD must include ETag");
  assert(Boolean(contentVersion), "manifest HEAD must include X-Content-Version");
});

addCheck("manifest conditional HEAD returns 304", async () => {
  const initial = await request("/api/content/manifest", { method: "HEAD" });
  const etag = initial.response.headers.get("etag");

  assert(Boolean(etag), "cannot test conditional request without ETag");

  const conditional = await request("/api/content/manifest", {
    headers: { "if-none-match": etag },
    method: "HEAD",
  });

  assert(conditional.response.status === 304, `expected 304, got ${conditional.response.status}`);
});

addCheck("comments route rejects anonymous users", async () => {
  const { json, response } = await request("/api/lessons/1/comments");

  assert(response.status === 401, `expected 401, got ${response.status}`);
  assert(json?.error === "Authentication required", "comments 401 error mismatch");
});

addCheck("welcome is public and Level 1 presents its Start Here gate", async () => {
  const welcome = await request("/welcome");
  assert(welcome.response.status === 200, `welcome expected 200, got ${welcome.response.status}`);

  const level = await request("/levels/1", { headers: { accept: "text/html" } });
  assert(level.response.status === 200, `Level 1 expected 200, got ${level.response.status}`);
  assert(
    level.text.includes("Start Here required") &&
      level.text.includes("/welcome?next=/levels/1"),
    "Level 1 must render the Start Here access state and welcome action",
  );
});

addCheck("sync route rejects anonymous users", async () => {
  const { json, response } = await request("/api/sync/user-manual");

  assert(response.status === 401, `expected 401, got ${response.status}`);
  assert(json?.error === "Authentication required", "sync 401 error mismatch");
});

addCheck("practice progress rejects anonymous users", async () => {
  const { json, response } = await request("/api/progress/practices");

  assert(response.status === 401, `expected 401, got ${response.status}`);
  assert(json?.error === "Authentication required", "practice progress 401 error mismatch");
});

addCheck("downloads reject anonymous users", async () => {
  const { json, response } = await request("/api/downloads");

  assert(response.status === 401, `expected 401, got ${response.status}`);
  assert(json?.error === "Authentication required", "downloads 401 error mismatch");
});

if (process.env.USER_MANUAL_CHECK_MOBILE_REFRESH) {
  addCheck("mobile token refresh validates request body", async () => {
    const { json, response } = await request("/api/auth/islands/mobile-refresh", {
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    assert(response.status === 400, `expected 400, got ${response.status}`);
    assert(json?.error === "refreshToken is required", "mobile refresh validation error mismatch");
  });
}

if (process.env.USER_MANUAL_CHECK_MOBILE_CHECKOUT_RETURN) {
  addCheck("mobile checkout return rejects unsupported schemes", async () => {
    const { json, response } = await request(
      "/paid/mobile-return?status=success&return_to=https%3A%2F%2Fexample.com",
    );

    assert(response.status === 400, `expected 400, got ${response.status}`);
    assert(
      json?.error === "Unsupported mobile checkout return URL",
      "mobile checkout return validation error mismatch",
    );
  });

  addCheck("mobile checkout return redirects to native scheme", async () => {
    const { response } = await request(
      "/paid/mobile-return?status=success&session_id=cs_test_123&return_to=usermanual%3A%2F%2Fcheckout%2Fsuccess",
    );
    const location = response.headers.get("location");

    assert(response.status === 307, `expected 307, got ${response.status}`);
    assert(
      location === "usermanual://checkout/success?status=success&session_id=cs_test_123",
      `unexpected redirect location: ${location}`,
    );
  });
}

addAuthenticatedCheck("authenticated manifest marks user signed in", async () => {
  const { json, response } = await request("/api/content/manifest", {}, { auth: true });

  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(json?.access?.signedIn === true, "manifest access.signedIn must be true with cookie");
});

addAuthenticatedCheck("authenticated sync returns personal state", async () => {
  const { json, response } = await request("/api/sync/user-manual", {}, { auth: true });

  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(json?.schemaVersion === 1, "sync schemaVersion must be 1");
  assert(typeof json?.syncVersion === "string", "sync must include syncVersion");
  assert(Array.isArray(json?.progress?.levels), "sync must include progress.levels");
  assert(Array.isArray(json?.progress?.practices), "sync must include progress.practices");
});

addAuthenticatedCheck("authenticated sync HEAD supports 304", async () => {
  const initial = await request("/api/sync/user-manual", { method: "HEAD" }, { auth: true });
  const etag = initial.response.headers.get("etag");
  const syncVersion = initial.response.headers.get("x-sync-version");

  assert(initial.response.status === 200, `expected 200, got ${initial.response.status}`);
  assert(Boolean(etag), "sync HEAD must include ETag");
  assert(Boolean(syncVersion), "sync HEAD must include X-Sync-Version");

  const conditional = await request(
    "/api/sync/user-manual",
    {
      headers: { "if-none-match": etag },
      method: "HEAD",
    },
    { auth: true },
  );

  assert(conditional.response.status === 304, `expected 304, got ${conditional.response.status}`);
});

addAuthenticatedCheck("authenticated practice progress is readable", async () => {
  const { json, response } = await request("/api/progress/practices", {}, { auth: true });

  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(Array.isArray(json?.practices), "practice progress must include practices array");
});

addAuthenticatedCheck("authenticated downloads route reaches entitlement layer", async () => {
  const { json, response } = await request("/api/downloads", {}, { auth: true });

  assert([200, 403].includes(response.status), `expected 200 or 403, got ${response.status}`);
  if (response.status === 200) {
    assert(Array.isArray(json?.downloads), "downloads response must include downloads array");
  } else {
    assert(json?.error === "Purchase required", "downloads 403 error mismatch");
  }
});

addAuthenticatedCheck("authenticated comments route reaches entitlement layer", async () => {
  const { json, response } = await request("/api/lessons/1/comments", {}, { auth: true });

  assert([200, 403].includes(response.status), `expected 200 or 403, got ${response.status}`);
  if (response.status === 200) {
    assert(Array.isArray(json?.comments), "comments response must include comments array");
  } else {
    assert(json?.error === "Purchase required", "comments 403 error mismatch");
  }
});

let failed = 0;

console.log(`User Manual smoke test: ${baseUrl}`);

for (const check of checks) {
  try {
    await check.fn();
    console.log(`ok - ${check.name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${check.name}`);
    console.error(`  ${error.message}`);
  }
}

if (authCookie) {
  console.log("Authenticated smoke checks: enabled");

  for (const check of authenticatedChecks) {
    try {
      await check.fn();
      console.log(`ok - ${check.name}`);
    } catch (error) {
      failed += 1;
      console.error(`not ok - ${check.name}`);
      console.error(`  ${error.message}`);
    }
  }
} else {
  console.log("Authenticated smoke checks: skipped; set USER_MANUAL_COOKIE to enable them.");
}

if (failed > 0) {
  console.error(`${failed} smoke check${failed === 1 ? "" : "s"} failed.`);
  process.exit(1);
}

const enabledCheckCount = checks.length + (authCookie ? authenticatedChecks.length : 0);
console.log(`${enabledCheckCount} smoke checks passed.`);
