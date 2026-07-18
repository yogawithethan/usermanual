# Native Mobile Implementation Plan

The native app should treat the existing User Manual web app and Supabase project as the source of truth. The current repo already has the important backend contract:

- Public content manifest: `GET /api/content/manifest`
- Personal sync payload: `GET /api/sync/user-manual`
- Progress mutations: `PATCH /api/progress/levels`, `PATCH /api/progress/practices`
- Notes, photos, downloads, protected media, public comments, and teacher answers through existing API routes
- Supabase tables for `profiles`, `product_entitlements`, `purchases`, `tutorial_progress`, `practice_progress`, `user_notes`, `progress_photos`, `lesson_questions`, `lesson_answers`, content tables, downloads, practice universes, and practices

## Recommended App Stack

Use Expo + React Native for the first native app.

This keeps iOS and Android in one implementation while still producing native screens, navigation, media playback, secure storage, push notifications, and platform purchase integrations. A pure Swift app would feel excellent on iOS, but it would create a second implementation before the backend/product contract is stable and delay Android. Expo is the pragmatic native layer for this product phase.

## Data Ownership

Supabase remains the shared backend. The mobile app should not read arbitrary tables directly for core product screens during MVP. It should use the web app API contract first:

- `manifest` is the published content catalog.
- `sync` is the signed-in user's state.
- mutation endpoints write progress, notes, photos, and comments.
- media/download endpoints preserve entitlement checks and return redirects or signed URLs.

Direct Supabase client usage can be added later for realtime comments, storage uploads, and edge cases, but the first app should keep entitlement and content access rules centralized in the existing routes.

## Auth

The mobile app should use Islands SSO via an OAuth-style browser session:

1. Mobile app opens Islands authorize URL with `client_id`, `redirect_uri`, `state`, and `mode`.
2. Islands returns to a native deep link, for example `usermanual://auth/callback`.
3. Mobile exchanges `code` for Supabase `access_token` and `refresh_token`.
4. Mobile posts the returned code to `POST /api/auth/islands/mobile-token`.
5. The API exchanges the code with Islands using the server-held client secret and returns Supabase tokens.
6. Tokens are stored in secure native storage.
7. API calls send `Authorization: Bearer <access_token>`.

The web API now supports cookie sessions and bearer-token sessions through the shared Supabase server client.

## Navigation Shape

Recommended first navigation:

- Welcome: public free welcome video and sign-in entry
- Home: 11-module map with 6 main levels and 5 side quests
- Level detail: tutorial sections, media, FAQs, comments, notes, checklist, completion action
- Side quest detail: branded universe header, sections, practice list, media, FAQs/comments later
- Practice player: audio/video, completion, streak increment
- Library: practice library, downloads, FAQs
- Progress: completed levels, practice streaks, photos, notes
- Account: Islands identity, entitlement, restore purchase, settings

The UI should share the same information architecture across universes while allowing each side quest to override color, display fonts, iconography, and motion/texture.

## Product Access Rules

- Welcome video: public.
- Free tutorial start: requires sign-in.
- Practice library, FAQs, downloads, paid content: requires active `product_entitlements` row for `the-user-manual`.
- One-time purchase: `$144` unlock for `the-user-manual`.
- App Store purchase support should write `purchases.provider = 'apple_iap'` and `product_entitlements.source = 'apple_iap'`.
- Stripe web purchases and Apple purchases must converge on the same entitlement row semantics.

## Offline And Sync

MVP should cache:

- latest content manifest by `ETag` and `X-Content-Version`
- latest user sync payload by `ETag` and `X-Sync-Version`
- pending progress, notes, photo metadata, and comments in a local outbox

Conflict rule for MVP:

- content is server-wins
- progress completion is monotonic where possible
- notes are last-write-wins per note id until explicit conflict UI is needed
- photos upload through the existing API and remain server-owned

## Folder Structure

```text
apps/mobile/
  app/
    _layout.tsx
    index.tsx
  src/
    api/
      userManual.ts
    auth/
      session.ts
    content/
      types.ts
    theme/
      universes.ts
```

Future expansion:

```text
apps/mobile/src/
  features/
    levels/
    side-quests/
    practices/
    progress/
    comments/
    purchases/
  storage/
    cache.ts
    outbox.ts
  navigation/
    linking.ts
```

## MVP Build Order

1. Mobile shell, routing, theme tokens, and API client.
2. Public manifest fetch with ETag cache and 11-module home map.
3. Islands SSO deep-link login and bearer-token API support.
4. Signed-in sync payload and progress state display.
5. Level detail for Level 1 with tutorial sections, FAQ, notes, and completion.
6. Paid gate and `$144` unlock flow.
7. Practice library and protected media redirects.
8. Side quest detail screens with per-universe visual identities.
9. Downloads, progress photos, and comments.
10. Push/local reminders and Android packaging.

## Backend Gaps To Close

- Add the production mobile redirect URI/client id to Islands SSO.
- Decide whether mobile purchase unlock uses Stripe web checkout first, Apple IAP at launch, or both.
- Add a server endpoint for purchase restore/status if Apple IAP is included.
- Extend sync payload for streaks if streaks should be first-class rather than derived from `practice_progress`.
- Confirm whether side quest FAQs/comments need shared tables keyed by `universe_slug`, not only `tutorial_level`.
