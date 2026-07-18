"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";

const USER_MANUAL_PRODUCT_SLUG = "the-user-manual" as const;

type SupabaseClient = ReturnType<typeof createClient>;
type Session = Awaited<ReturnType<SupabaseClient["auth"]["getSession"]>>["data"]["session"];
type User = NonNullable<Session>["user"];

type AuthCtx = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  entitled: boolean;
  refreshEntitlements: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: string | null;
    alreadyRegistered: boolean;
    needsConfirmation: boolean;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [entitled, setEntitled] = useState(false);
  const lastCheckedUserId = useRef<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const fetchEntitlement = useCallback(
    async (userId: string | null) => {
      if (!userId) {
        setEntitled(false);
        return;
      }

      const { data, error } = await supabase
        .from("product_entitlements")
        .select("status")
        .eq("user_id", userId)
        .eq("product_slug", USER_MANUAL_PRODUCT_SLUG)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        console.warn("[auth] entitlement check failed", error.message);
        return;
      }

      setEntitled(Boolean(data));
    },
    [supabase],
  );

  const refreshEntitlements = useCallback(async () => {
    await fetchEntitlement(session?.user?.id ?? null);
  }, [fetchEntitlement, session?.user?.id]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const userId = session?.user?.id ?? null;
    if (lastCheckedUserId.current === userId) return;
    lastCheckedUserId.current = userId;
    void fetchEntitlement(userId);
  }, [fetchEntitlement, session?.user?.id]);

  const value = useMemo<AuthCtx>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      entitled,
      refreshEntitlements,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          const message = (error.message ?? "").toLowerCase();
          const alreadyRegistered =
            message.includes("already registered") ||
            message.includes("user already") ||
            message.includes("already exists");
          return {
            error: error.message,
            alreadyRegistered,
            needsConfirmation: false,
          };
        }

        const identities = (data.user as unknown as { identities?: unknown[] } | null)
          ?.identities;
        const alreadyRegistered = Array.isArray(identities) && identities.length === 0;
        if (alreadyRegistered) {
          return {
            error: "An Islands account already exists for this email.",
            alreadyRegistered: true,
            needsConfirmation: false,
          };
        }

        return {
          error: null,
          alreadyRegistered: false,
          needsConfirmation: !data.session,
        };
      },
      async signOut() {
        await supabase.auth.signOut();
        setEntitled(false);
      },
      async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error: error?.message ?? null };
      },
    }),
    [entitled, ready, refreshEntitlements, session, supabase],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
