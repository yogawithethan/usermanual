import { LegalDocument } from "@/components/legal/LegalDocument";
import { USER_MANUAL_LEGAL_VERSION } from "@/lib/legal";

export const metadata = { title: "Refunds · The User Manual" };

export default function RefundsPage() {
  return (
    <LegalDocument title="Refund and purchase help" version={USER_MANUAL_LEGAL_VERSION}>
      <p>The User Manual lifetime companion is a one-time digital purchase. Before checkout, the product identifies included material that is available now and material marked Coming soon.</p>
      <section><h2>30-day refund window</h2><p>You may request a refund within 30 calendar days of your purchase by emailing <a href="mailto:hello@yogawithethan.com">hello@yogawithethan.com</a> from the address connected to your Yoga With Ethan account. Include the approximate purchase date and Stripe receipt or session details if available. Do not send complete card information.</p></section>
      <section><h2>Coming soon and product use</h2><p>Clearly marked Coming soon material does not shorten or remove the 30-day refund window. Watching, reading, practicing with, or downloading included material does not by itself make an otherwise eligible request ineligible. We may decline requests involving fraud, abuse, chargeback misuse, or repeated purchase-and-refund behavior.</p></section>
      <section><h2>How requests are handled</h2><p>We aim to respond within five business days. Approved refunds are returned to the original payment method; your bank or card provider may take additional time to post the credit. Any mandatory refund, cancellation, or digital-content rights in your jurisdiction continue to apply. This policy does not remove rights that applicable law gives you.</p></section>
      <section><h2>Access and reversals</h2><p>A completed refund, payment reversal, or dispute normally revokes the related lifetime entitlement. If a refund or dispute was recorded incorrectly, contact support so the payment and account records can be reconciled.</p></section>
      <section><h2>Purchase recovery</h2><p>Checkout success pages are not proof of payment. Access is attached to the shared account only after Stripe confirms payment. If payment succeeded but access is missing, support can safely replay or reconcile the verified Stripe event without requiring a second purchase.</p></section>
      <section><h2>Contact</h2><p>This policy is provided by Ethan Hill LLC, a North Carolina limited liability company doing business as Yoga With Ethan. Contact <a href="mailto:hello@yogawithethan.com">hello@yogawithethan.com</a> for refund and purchase support.</p></section>
    </LegalDocument>
  );
}
