import { LegalDocument } from "@/components/legal/LegalDocument";
import { USER_MANUAL_PRIVACY_VERSION } from "@/lib/legal";

export const metadata = { title: "Privacy · The User Manual" };

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy notice" version={USER_MANUAL_PRIVACY_VERSION}>
      <p>This notice explains how Ethan Hill LLC, a North Carolina limited liability company doing business as Yoga With Ethan, uses personal information for The User Manual and its connection to the larger Yoga With Ethan membership system.</p>
      <section><h2>Information we use</h2><ul><li>Shared account information, such as your Islands user identifier, name, and email address.</li><li>Your welcome completion, level and tutorial progress, reminder preferences, release interests, questions, and related activity.</li><li>Purchase and entitlement records, including Stripe session, payment, refund, or dispute identifiers. We do not store your complete card number.</li><li>A linked Telegram identifier when you choose Telegram notifications.</li><li>Security and operational information such as request times, errors, and limited device or network data needed to prevent abuse and diagnose failures.</li></ul></section>
      <section><h2>Why we use it</h2><p>We use this information to authenticate you, preserve your progress, deliver paid access, send requested transactional or reminder messages, answer questions, prevent fraud, recover purchases, support members, and improve the reliability of the service.</p></section>
      <section><h2>Services involved</h2><p>The service uses carefully scoped providers, including Islands for identity, Cloudflare for application and database infrastructure, Stripe for payment processing, Resend for email delivery, Telegram when you enable it, and media providers such as Vimeo when media is published. These providers process information according to their roles and terms.</p></section>
      <section><h2>Cookies and local settings</h2><p>We use necessary cookies for the shared signed-in session and welcome handoff, plus local browser storage for interface preferences. We do not use those necessary values as proof of payment; the verified server entitlement remains authoritative.</p></section>
      <section><h2>Choices</h2><p>Email and Telegram reminders are optional. You can change User Manual reminder preferences in your profile. Global Yoga With Ethan unsubscribe and suppression choices take priority. Transactional messages such as purchase confirmation or security notices may still be sent when necessary to provide the service.</p></section>
      <section><h2>Retention and security</h2><p>We retain account, purchase, progress, and support records for as long as reasonably needed to provide lifetime access, meet legal obligations, resolve disputes, prevent abuse, and maintain reliable records. We use access controls, signed sessions, encrypted transport, rate limits, backups, and monitoring, but no online system can promise absolute security.</p></section>
      <section><h2>Your requests</h2><p>You may ask to access, correct, export, or delete eligible personal information, or object to certain processing. Purchase, fraud-prevention, tax, or legal records may need to be retained. We may verify your identity before completing a request. Send privacy and data requests to <a href="mailto:hello@yogawithethan.com">hello@yogawithethan.com</a>.</p></section>
      <section><h2>International use and children</h2><p>Yoga With Ethan and its providers may process information in countries other than your own. The service is not directed to children who cannot legally consent to an online service in their jurisdiction without a parent or guardian.</p></section>
      <section><h2>Changes</h2><p>If this notice changes materially, we will update the effective date and provide an appropriate notice through the service or your selected communication channel.</p></section>
      <section><h2>Contact</h2><p>Ethan Hill LLC is responsible for this notice. Contact us at <a href="mailto:hello@yogawithethan.com">hello@yogawithethan.com</a> with privacy or support questions.</p></section>
    </LegalDocument>
  );
}
