# Goal 4 — launch member journey

## Outcome

The launch journey now has one member authority: Islands authenticates the
customer, the Yoga With Ethan Worker enforces policy, and Yoga With Ethan D1
stores member state. The Next app is a responsive client and same-origin API
gateway; it is not a second member backend.

## Implemented journey

1. Anyone may view and finish the welcome experience.
2. Opening Level 1 requires the shared Yoga With Ethan Islands account.
3. The signed-in welcome completion is saved to D1.
4. Levels 1–6 unlock sequentially and complete only when the member presses the
   completion control.
5. The $144 lifetime checkout may begin at any point. Purchase never bypasses
   level progression.
6. Only a verified Stripe webhook grants the D1 entitlement. Duplicate webhook
   delivery is idempotent. Refunds and disputes revoke protected access.
7. The five paid tutorials require both the lifetime entitlement and their
   corresponding completed free level. Level 6 grants no tutorial at launch.
8. Paid comments/questions, release interest, reminder preferences, current
   progress, and append-only activity share the same member account.
9. Telegram preferences fail closed until that subscriber has a linked Telegram
   identity. Purchase confirmation email uses the shared transactional sender.

## Runtime configuration

Worker secrets/variables:

- `SESSION_SECRET` or `AUTH_HMAC_KEY`
- `ISLANDS_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_USER_MANUAL_PRICE_ID`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Next/OpenNext variables:

- `YWE_WORKER_ORIGIN=https://auth.yogawithethan.com`
- `NEXT_PUBLIC_SITE_URL=https://tutorial.yogawithethan.com`
- existing content-store variables while structured content remains staged

Stripe sends User Manual events to
`https://tutorial.yogawithethan.com/api/stripe/webhook` (the same-origin gateway)
or directly to `https://auth.yogawithethan.com/api/stripe/user-manual/webhook`.

## Production gate

Local code and migration verification do not authorize production mutation.
Goal 6 applies migrations `0109` and `0110`, performs any one-time legacy state
import, checks counts and samples, disables legacy member-state writes, and only
then deploys the Worker and OpenNext unit. There must never be two canonical
writers for progress, entitlements, questions, or release interest.

## Verification

```sh
node scripts/verify-user-manual-journey.mjs
node scripts/verify-user-manual-foundation.mjs
cd user-manual && corepack pnpm typecheck
cd user-manual && corepack pnpm build:verify
cd user-manual && corepack pnpm cf:build:verify
```
