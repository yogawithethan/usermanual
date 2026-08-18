import type { Metadata } from "next";

import { ProductCheckoutEmbed } from "./ProductCheckoutEmbed";

export const metadata: Metadata = {
  title: "Checkout · The User Manual",
  description: "Purchase lifetime access to The User Manual by Yoga with Ethan.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const preview = (await searchParams).preview === "1";
  return <ProductCheckoutEmbed preview={preview} />;
}
