import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${appChromeFontClassName} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden">
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
