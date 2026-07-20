# User Manual integration into Yoga With Ethan

## Decision

Move the User Manual web app into the Yoga With Ethan repository as its own
build and deployment unit. It should share the platform, not be folded into the
legacy dashboard bundle. The Next application remains independently deployable
at `tutorial.yogawithethan.com`, while the Yoga With Ethan Worker and D1 become
its member backend.

Do not deploy the standalone User Manual Supabase migrations for member
identity, progress, entitlements, comments, or release notifications. They are
useful as domain prototypes and migration inputs only.

The machine-readable Goal 1 safety state lives at the repository-relative path
`docs/USER_MANUAL_FOUNDATION_GATES.json`. Its
production, remote-migration, customer-import, and D1 product-write flags must
remain false throughout this goal.

## Canonical ownership

| Concern | Canonical owner |
| --- | --- |
| Login and session | Islands plus the shared Yoga With Ethan cookie |
| Member identity link | Yoga With Ethan D1 |
| Purchases and entitlements | Yoga With Ethan D1, populated by verified Stripe webhooks |
| Current level/tutorial progress | Yoga With Ethan D1 |
| Cross-product activity timeline | Append-only Yoga With Ethan D1 ledger |
| Reminder state and preferences | Yoga With Ethan D1 |
| Email and Telegram delivery | Yoga With Ethan messaging control plane |
| Structured User Manual content | Temporary existing content store, then D1 |
| Video, audio, images, downloads | R2 or the approved protected media store |

## Identity model

Add an immutable identity bridge instead of joining product data by email:

```sql
member_accounts (
  id INTEGER PRIMARY KEY,
  islands_user_id TEXT UNIQUE NOT NULL,
  subscriber_id INTEGER UNIQUE NOT NULL,
  email_normalized TEXT NOT NULL,
  welcome_completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)
```

On a successful Islands callback, the Worker resolves or creates the D1
subscriber from the verified email, persists the Islands subject link, and then
mints the existing shared session. Email changes update contact data without
changing the member's progress identity.

During migration, existing member magic-link sessions may be accepted as a
compatibility path, but they must resolve to this same member record. They must
not create a second identity authority.

## D1 product records

Add current-state tables for free-level progress, paid-tutorial progress,
release interest, and lifecycle nudge state. Add one generic append-only
`member_activity` table for all Yoga With Ethan products rather than a private
User Manual event log.

Every mutation follows this rule:

1. Authenticate the shared member.
2. Enforce progression and entitlement policy in the Worker.
3. Idempotently update current state.
4. Append a deduplicated activity event.
5. Recalculate the next eligible lifecycle nudge.

Entitlements remain separate from activity. An activity event can explain what
a member did; only the purchase/entitlement resolver decides what they own.

## Reminder behavior

The first launch-ready lifecycle segments are:

- welcome finished but Level 1 not started;
- a level started but no meaningful activity followed;
- a level completed but the next level was not started;
- an unlocked, owned tutorial was never opened;
- a customer registered interest in coming-soon content;
- newly released content matches an active release-interest record.

Email is available to members who have not suppressed it. Telegram is available
only after the same member record has a linked Telegram identity and the member
explicitly enables User Manual reminders. Both channels must obey global
suppression, pacing, quiet-hour, collision, and delivery-ledger rules.

## Cutover order

1. Register the User Manual as a governed Yoga With Ethan deploy unit and move
   the Next project without changing its visual behavior.
2. Add the D1 identity bridge and make Islands login resolve one member record.
3. Add D1 progress, activity, release-interest, and nudge-state migrations plus
   Worker APIs and contract tests.
4. Repoint the web app's session, progression, comments, and entitlement calls
   to the Worker.
5. Import existing User Manual customer state once, verify counts and sampled
   records, then disable old writes. Never run two canonical writers.
6. Connect lifecycle events to the shared email and Telegram scheduler.
7. Migrate structured content and protected media independently.
8. Run authenticated, paid, refunded, coming-soon, reminder, mobile-layout, and
   reduced-motion end-to-end tests before production cutover.
