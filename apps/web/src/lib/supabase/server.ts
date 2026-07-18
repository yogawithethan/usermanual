import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@islands/db";

import { getSupabaseEnv } from "./env";

function bearerHeader(value: string | null) {
  if (!value?.toLowerCase().startsWith("bearer ")) {
    return undefined;
  }

  return value;
}

export async function createClient() {
  const { publishableKey, url } = getSupabaseEnv();
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const authorization = bearerHeader(headerStore.get("authorization"));

  const developmentFetch =
    process.env.NODE_ENV !== "production"
      ? (input: RequestInfo | URL, init?: RequestInit) => {
          const timeout = AbortSignal.timeout(2_000);
          const signal = init?.signal
            ? AbortSignal.any([init.signal, timeout])
            : timeout;
          return fetch(input, { ...init, signal });
        }
      : undefined;

  return createServerClient<Database>(url, publishableKey, {
    global:
      authorization || developmentFetch
        ? {
            fetch: developmentFetch,
            headers: authorization
              ? {
                  Authorization: authorization,
                }
              : undefined,
          }
        : undefined,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; route handlers and server
          // actions still handle auth state changes.
        }
      },
    },
  });
}
