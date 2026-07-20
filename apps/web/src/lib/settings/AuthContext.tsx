"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type User = { id: string; email: string };
type Session = { user: User };

type AuthCtx = {
  ready: boolean;
  session: Session | null;
  user: User | null;
  entitled: boolean;
  refreshEntitlements: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; alreadyRegistered: boolean; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [entitled, setEntitled] = useState(false);

  const refreshEntitlements = useCallback(async () => {
    const response = await fetch("/api/member/session", { cache: "no-store" });
    const result = (await response.json().catch(() => ({ signedIn: false }))) as {
      signedIn: boolean;
      member?: { email?: string };
      access?: { entitled?: boolean };
    };
    if (result.signedIn && result.member?.email) {
      setSession({ user: { id: "shared-ywe-member", email: result.member.email } });
      setEntitled(Boolean(result.access?.entitled));
    } else {
      setSession(null);
      setEntitled(false);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    void refreshEntitlements();
  }, [refreshEntitlements]);

  const value = useMemo<AuthCtx>(() => ({
    ready,
    session,
    user: session?.user ?? null,
    entitled,
    refreshEntitlements,
    async signIn() {
      window.location.assign("/login");
      return { error: null };
    },
    async signUp() {
      window.location.assign("/login?mode=signup");
      return { error: null, alreadyRegistered: false, needsConfirmation: false };
    },
    async signOut() {
      await fetch("/api/member/logout", { method: "POST" });
      setSession(null);
      setEntitled(false);
      window.location.assign("/");
    },
    async resetPassword() {
      window.location.assign("https://islands.bio/auth/reset-password");
      return { error: null };
    },
  }), [entitled, ready, refreshEntitlements, session]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
