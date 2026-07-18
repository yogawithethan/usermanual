# The User Manual product contract

This document is the canonical launch contract for product access, progression,
payments, and content availability. Application code, database policies, tests,
and customer-facing copy must agree with it.

## Launch surface

- The launch product is a responsive web application.
- Native iOS and Android applications are not launch requirements.
- APIs, design tokens, content schemas, and access-state semantics should remain
  portable so a future React Native client can consume the same backend contract.

## Yoga With Ethan platform ownership

- The User Manual is a Yoga With Ethan product surface, not a separate member
  platform.
- The existing Yoga With Ethan passwordless email session is the launch identity
  provider. The User Manual must use that shared login and must not create a
  second customer login. Islands SSO is explicitly deferred to a later phase.
- Yoga With Ethan D1 is the canonical store for member identity links,
  purchases, entitlements, progress, activity, notification preferences, and
  reminder state.
- The Yoga With Ethan Worker is the authenticated API and policy boundary for
  the web app and future native clients. Browser code must not write canonical
  member state directly to a separate Supabase project.
- Content and media may remain in their current store during a staged migration,
  but that store must not remain a second authority for customer identity,
  access, progress, or messaging.
- The verified email from the Yoga With Ethan member session resolves to one
  durable Yoga With Ethan subscriber/member ID. A future Islands migration must
  link to that same record rather than create a second identity.

## Free journey

- The public welcome experience is available without an account.
- A user must explicitly finish the welcome experience before opening Level 1.
- Level 1 and all later levels require a signed-in account.
- The six Deeper, Slower, Easier levels are free.
- Levels unlock sequentially. Completing Level N unlocks Level N + 1.
- A user completes a level by deliberately pressing its completion button.
  Watching the entire video and checking checklist items are not prerequisites.
- Each free level includes its published lesson copy, footnotes, FAQ content, and
  core video.
- Practice audio is not included in free access.
- Reading community comments and asking a question are paid features.

## Paid companion

- The paid companion is one USD $144 lifetime purchase.
- A customer may purchase before completing Level 1.
- The purchase grants ownership of all paid User Manual tutorials, protected
  practice audio, downloads, community comments/questions, and future User
  Manual additions included in this offer.
- Payment and progression are independent gates. Purchasing does not skip the
  required Deeper, Slower, Easier levels.
- Completing a free level makes its related paid tutorial progression-eligible:
  - Level 1: Wake the F*ck Up
  - Level 2: Prana Fusion
  - Level 3: Yoga Reset
  - Level 4: Gravity Yoga
  - Level 5: Here to There
  - Level 6: no paid tutorial at launch
- A paid tutorial may be marked `coming soon`. Customers retain lifetime access
  and may register interest in release notifications while its content is being
  completed.

## Canonical access states

Customer-facing components must distinguish these states rather than reducing
them to a generic locked/unlocked flag:

1. `welcome-required`: the public welcome has not been finished.
2. `account-required`: the feature requires sign-in.
3. `progression-locked`: the prerequisite free level is incomplete.
4. `payment-locked`: progression is satisfied but the lifetime purchase is absent.
5. `purchased-progression-locked`: purchased, but prerequisite level incomplete.
6. `coming-soon`: owned or purchasable content is not yet released.
7. `available`: all relevant gates are satisfied.
8. `in-progress`: available content has saved activity.
9. `completed`: the user has completed the content.

## Notifications

- Customers receive transactional email confirmation after a successful purchase.
- Customers may opt into email notification for coming-soon content releases.
- Yoga With Ethan operational Telegram notifications should cover purchases,
  entitlement-delivery failures, paid questions, and release-interest activity.
- Customers may opt into Telegram reminders and release notifications after
  linking a Telegram account to the same Yoga With Ethan member record.
- Email and Telegram reminders must use Yoga With Ethan's shared messaging
  control plane, suppression rules, delivery ledger, and global preferences.
- Reminder eligibility is derived from meaningful User Manual activity and
  current progression state. It must not depend on completion percentages or
  forced video/audio consumption.

## Progress and activity tracking

- The current state of every free level and paid tutorial is stored separately
  from the append-only member activity history.
- Meaningful events include welcome completion, level or tutorial start/resume,
  deliberate completion, paid-media use, checkout milestones, purchase,
  question submission, and release-interest changes.
- Every accepted progress mutation records both the latest state and an
  idempotent activity event so support, reminders, and the member's recent
  activity view agree.
- Activity history informs messaging and customer support but is not itself an
  entitlement authority.
- Users can pause or opt out of lifecycle reminders without losing purchase or
  progress state.

## Payment authority

- A checkout redirect is not proof of payment.
- Only a verified, idempotently processed Stripe webhook may create an active
  Stripe entitlement.
- Refunded, revoked, expired, or disputed access must be enforced by protected
  routes and storage delivery, not only by the visible interface.
