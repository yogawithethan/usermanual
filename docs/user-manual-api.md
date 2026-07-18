# User Manual API Contract

Web app URL: `https://tutorial.yogawithethan.com`

This document is the shared contract for the web app and future iOS/Android
apps. The Yoga With Ethan Worker owns these authenticated APIs. The web app may
expose them as same-origin routes, but those routes are a gateway to the Worker,
not a separate member backend. The app uses the existing Islands session and
shared Yoga With Ethan member identity.

## Session and member identity

`GET /api/member/session`

Returns the current shared Yoga With Ethan member session. For a signed-in user,
the Worker resolves the verified Islands subject to one canonical D1 member and
subscriber record. It does not create a User Manual-specific account.

Anonymous response:

```json
{ "signedIn": false }
```

Authenticated response includes opaque client-safe IDs and capabilities, never
the database's authority fields:

```json
{
  "signedIn": true,
  "member": { "displayName": "Ethan", "email": "e@example.com" },
  "capabilities": { "email": true, "telegramLinked": true }
}
```

## Content Manifest

`GET /api/content/manifest`

Returns the published source of truth for The User Manual content:

- `schemaVersion`
- `contentVersion`
- `generatedAt`
- `product`
- `access`
- `levels`
- `practiceUniverses`
- `downloads`

Private storage details are intentionally not exposed. Paid media/downloads use API `href` fields that enforce auth and entitlement checks.

`HEAD /api/content/manifest`

Returns only headers for cheap mobile/web sync checks:

- `ETag`
- `X-Content-Version`
- `Cache-Control`

Clients should store `ETag` and send `If-None-Match`. A `304` means the cached manifest is still current.

## User Sync

`GET /api/sync/user-manual`

Requires sign-in. Returns the current user's app state:

- `schemaVersion`
- `syncVersion`
- `generatedAt`
- `access`
- `profile`
- `progress.levels`
- `progress.practices`
- `userContent.notes`
- `userContent.photos`
- `questions`

`HEAD /api/sync/user-manual`

Requires sign-in. Returns only:

- `ETag`
- `X-Sync-Version`
- `Cache-Control`

Use this for lightweight personal-data sync checks. A `304` means local user state is still current.

## Progress

`PATCH /api/progress/levels`

Requires sign-in. Body:

```json
{
  "levelNumber": 1,
  "status": "in_progress"
}
```

Allowed statuses: `not_started`, `in_progress`, `completed`.

The Worker writes the current progress row and a deduplicated activity event as
one logical mutation. Completion occurs only when the member deliberately uses
the completion control; video, audio, and checklist consumption are not
completion prerequisites.

## Activity and reminder preferences

`GET /api/activity/user-manual`

Requires sign-in. Returns the member's client-safe User Manual activity timeline
from the shared Yoga With Ethan activity ledger.

`GET /api/preferences/user-manual-reminders`

Requires sign-in. Returns email and Telegram reminder preferences, whether a
Telegram identity is linked, and any pause-until date.

`PATCH /api/preferences/user-manual-reminders`

Requires sign-in. Updates User Manual lifecycle reminder preferences without
overriding global Yoga With Ethan suppression or unsubscribe settings.

```json
{
  "emailEnabled": true,
  "telegramEnabled": false,
  "pausedUntil": null
}
```

`GET /api/progress/practices`

Requires sign-in. Returns current user practice progress.

`PATCH /api/progress/practices`

Requires sign-in. Body:

```json
{
  "practiceId": "uuid",
  "status": "completed"
}
```

Checks:

- practice exists and is published
- paid practice requires active User Manual entitlement
- user has completed enough levels for the practice unlock level
- completion count increments when status is `completed`

## Notes

`GET /api/notes`

Requires sign-in. Returns all User Manual notes.

`POST /api/notes`

Requires sign-in. Body:

```json
{
  "tutorialLevel": 1,
  "practiceId": null,
  "body": "Private student note"
}
```

`PATCH /api/notes/{id}` and `DELETE /api/notes/{id}` operate on the signed-in user's own notes.

## Progress Photos

`GET /api/progress/photos`

Requires sign-in. Returns photo records with `href` fields.

`POST /api/progress/photos`

Requires sign-in. Multipart form:

- `file`: image file
- `label`: optional
- `takenAt`: optional date

`GET /api/progress/photos/{id}`

Requires sign-in. Returns a short-lived signed URL redirect for the user's own photo.

## Practice Library

`GET /api/practices`

Requires sign-in and active User Manual entitlement. Optional query:

`?universe=wake-the-fck-up`

Returns published practices with media `href` values.

`GET /api/practices/{id}/media`

Requires sign-in, active User Manual entitlement for paid practices, and enough completed levels. Redirects to public media URL or short-lived signed storage URL.

## Downloads

`GET /api/downloads`

Requires sign-in and active User Manual entitlement. Returns download metadata with protected `href` fields.

`GET /api/downloads/{id}`

Requires sign-in and active User Manual entitlement. Redirects to public file URL or short-lived signed storage URL.

## Paid Community Questions And Teacher Answers

`GET /api/lessons/{level}/comments`

Requires sign-in and active User Manual entitlement. Returns public community
questions and teacher answers for the level without exposing internal user IDs.

`POST /api/lessons/{level}/comments`

Requires sign-in and active User Manual entitlement. Body:

```json
{
  "body": "Question from a student"
}
```

`POST /api/lessons/comments/{id}/answers`

Currently returns `403`. Teacher answers are managed through the YWE dashboard service-role API.

## Smoke Test

Run:

```sh
corepack pnpm smoke:um
```

Override the target:

```sh
USER_MANUAL_BASE_URL=https://tutorial.yoga-e65.workers.dev corepack pnpm smoke:um
```

The smoke test checks public manifest caching, the required public welcome route,
and anonymous protection for paid/authenticated routes including comments.

To include authenticated checks, pass a signed-in browser cookie:

```sh
USER_MANUAL_COOKIE='name=value; other=value' corepack pnpm smoke:um
```

Authenticated checks verify:

- manifest returns `access.signedIn: true`
- user sync returns personal state
- user sync `HEAD` supports `304`
- practice progress is readable
- downloads reach the entitlement layer, returning either `200` for entitled users or `403` for signed-in users without access
