import type { Metadata } from "next";
import Script from "next/script";
import { Suspense, ViewTransition } from "react";

import { AppProviders } from "@/components/settings/AppProviders";
import { SettingsRoot } from "@/components/settings/SettingsRoot";
import { PurchaseUnlockCard } from "@/components/purchase/PurchaseUnlockCard";
import { SharedYweHeader } from "@/components/navigation/SharedYweHeader";
import { appChromeFontClassName } from "@/themes/appChrome";

import "./globals.css";

export const metadata: Metadata = {
  title: "Yoga With Ethan",
  description: "A yoga education platform.",
};

const themeBootstrap = `
  (() => {
    try {
      const raw = localStorage.getItem("um:settings:v1");
      const theme = raw ? JSON.parse(raw).theme : "light";
      const mode = theme === "dark" || theme === "oled" ? "dark" : "light";
      document.documentElement.dataset.umTheme = mode;
      document.documentElement.dataset.theme = mode;
      document.documentElement.dataset.themeMode = mode;
    } catch {
      document.documentElement.dataset.umTheme = "light";
      document.documentElement.dataset.theme = "light";
      document.documentElement.dataset.themeMode = "light";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${appChromeFontClassName} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Script id="user-manual-theme" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        <Script src="/ywe-pixel.js?v=20260906-base-only" strategy="afterInteractive" />
        <AppProviders>
          <ViewTransition
            enter={{
              "nav-forward": "nav-forward",
              "nav-back": "nav-back",
              "library-mode": "library-mode",
              default: "none",
            }}
            exit={{
              "nav-forward": "nav-forward",
              "nav-back": "nav-back",
              "library-mode": "library-mode",
              default: "none",
            }}
            default="none"
          >
            <div className="contents">{children}</div>
          </ViewTransition>
          <PurchaseUnlockCard />
          <Suspense fallback={null}>
            <SharedYweHeader />
          </Suspense>
          <SettingsRoot />
        </AppProviders>
      </body>
    </html>
  );
}
