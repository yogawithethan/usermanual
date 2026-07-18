import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

export type { Database } from "./database.types";

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export interface SupabaseServiceConfig {
  serviceRoleKey: string;
  url: string;
}

export const islandsSupabaseProjectUrl =
  "https://swtsqngrkkhggjacfhft.supabase.co";

export type IslandsSupabaseClient = SupabaseClient<Database>;

export function createIslandsClient(
  config: SupabasePublicConfig,
): IslandsSupabaseClient {
  return createClient<Database>(config.url, config.publishableKey);
}

export function createIslandsServiceClient(
  config: SupabaseServiceConfig,
): IslandsSupabaseClient {
  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getBrowserSupabaseConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return { url, publishableKey };
}
