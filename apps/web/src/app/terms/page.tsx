import { LegalDocument } from "@/components/legal/LegalDocument";
import { USER_MANUAL_LEGAL_VERSION } from "@/lib/legal";

export const metadata = { title: "Terms · The User Manual" };

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of use" version={USER_MANUAL_LEGAL_VERSION}>
      <p>These terms govern your use of The User Manual, a Yoga With Ethan web experience offered by Ethan Hill LLC, a North Carolina limited liability company. By using the service or purchasing the lifetime companion, you agree to these terms.</p>
      <section><h2>One shared account</h2><p>The User Manual uses the same Islands and Yoga With Ethan identity as other connected experiences. You are responsible for keeping that account secure and for activity performed through it. Access is personal and may not be shared, resold, copied, or redistributed.</p></section>
      <section><h2>Free sequence</h2><p>After completing the public welcome experience and signing in, members may read the six Deeper, Slower, Easier levels and watch each available core video. Footnotes and prepared FAQs are free. A level is completed only when you deliberately mark it complete; media consumption and checklist items are not prerequisites.</p></section>
      <section><h2>Lifetime companion</h2><p>The lifetime companion is a one-time USD $144 purchase. It covers the five paid tutorial worlds, their included practice media and downloads, community comments and questions, and future additions that are expressly described as part of this offer. Purchase does not skip the free progression sequence.</p><p>Some paid tutorials or media may be marked <strong>Coming soon</strong> when you purchase. Those labels are shown in the product before checkout. You may opt into email or Telegram release notices, and you retain access to included releases when they become available.</p></section>
      <section><h2>Payments and access</h2><p>Payments are processed by Stripe. Yoga With Ethan does not receive your complete card number. Access is granted only after a verified payment event. Refunds, disputes, reversals, fraud, or misuse may suspend or revoke the related entitlement. See the <a href="/refunds">refund policy</a> for how to request help.</p></section>
      <section><h2>Educational and wellness information</h2><p>The User Manual is educational and is not medical diagnosis, treatment, physical therapy, or emergency care. Work within your capacity, stop if something feels unsafe, and consult an appropriate licensed professional when you have an injury, health condition, pregnancy, or other concern.</p></section>
      <section><h2>Availability and changes</h2><p>We may correct errors, improve the experience, replace hosting or media providers, and change features when reasonably necessary. We will not knowingly convert a paid lifetime entitlement into a recurring subscription without a new, explicit agreement.</p></section>
      <section><h2>Acceptable use</h2><p>Do not interfere with the service, bypass access controls, scrape protected content, upload unlawful material, impersonate another person, or use comments and questions to harass others. Community material may be moderated, hidden, or removed.</p></section>
      <section><h2>Responsibility</h2><p>To the extent permitted by applicable law, the service is provided without guarantees of a particular personal, health, or business result. Nothing in these terms limits rights or remedies that cannot legally be limited in your jurisdiction.</p></section>
      <section><h2>Governing law</h2><p>These terms are governed by the laws of the State of North Carolina, without regard to conflict-of-law rules, except where the mandatory law of your location applies. Before starting a formal dispute, please contact <a href="mailto:hello@yogawithethan.com">hello@yogawithethan.com</a> so we can try to resolve the issue directly.</p></section>
      <section><h2>Contact</h2><p>Questions about these terms may be sent to Ethan Hill LLC at <a href="mailto:hello@yogawithethan.com">hello@yogawithethan.com</a>.</p></section>
    </LegalDocument>
  );
}
