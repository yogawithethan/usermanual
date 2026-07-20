# Goal 5 — shared lifecycle messaging

## Outcome

The User Manual now supplies progress and release eligibility to Yoga With
Ethan's existing messaging control plane. It does not own a second contact
database, email preference model, Telegram bot, scheduler, or delivery ledger.

## Shared infrastructure

- `scheduled_messages` owns pending, sent, cancelled, and failed lifecycle jobs.
- `email_log` plus signed Resend webhook events own email delivery outcomes.
- `drishti_message_ledger` owns Telegram idempotency and delivery outcomes.
- `subscribers` owns global email suppression, timezone, Telegram identity,
  engagement state, and the 24-hour scheduled-send clock.
- `dristi_quieted` remains the global Telegram stop signal.
- User Manual reminder and release-interest rows only provide product-specific
  opt-in and pause state.

## Lifecycle opportunities

The scheduler derives one-time opportunities from meaningful state changes:

- welcome completed but Level 1 not started after three days;
- a level left in progress for five days;
- the next free level not started three days after its prerequisite completed;
- the highest newly unlocked, owned tutorial not opened after three days;
- opted-in coming-soon content becoming available.

Each opportunity and channel has one stable dedupe key. A progression change
creates a new eligibility anchor; repeated cron ticks do not create duplicate
jobs. Email and Telegram for the same opportunity may both deliver, but another
scheduled opportunity waits for the shared 24-hour pacing window.

## Safety and control

- Email reminders are marketing lifecycle messages and honor global pause or
  unsubscribe state. Purchase confirmation remains transactional.
- Telegram reminders require a linked identity, explicit User Manual opt-in,
  no global `/stop`, and a non-dormant Telegram engagement state.
- Both channels obey the subscriber's 7:00 AM–10:00 PM local window.
- Provider failures retry twice, then fail visibly and alert the existing
  Dṛṣṭi ops chat.
- Purchases, entitlement failures, paid questions, and release-interest changes
  alert the existing Dṛṣṭi ops channel with stable dedupe keys.
- `GET /__admin/user-manual/lifecycle` provides counts, recent jobs, and terminal
  failures behind the existing operator secret.

## Production gate

Nothing in Goal 5 authorizes a remote migration or deployment. Goal 6 applies
migrations `0109`, `0110`, and `0111`, verifies the imported member state and
messaging configuration, then stages the Worker and web deployment with a
rollback path. Legacy and D1 product writers must never run concurrently.

## Verification

```sh
node scripts/verify-user-manual-lifecycle.mjs
node scripts/verify-user-manual-journey.mjs
node scripts/verify-user-manual-foundation.mjs
node scripts/verify-lane.mjs user-manual-app
node scripts/verify-lane.mjs sequences
node scripts/verify-lane.mjs tags
```
