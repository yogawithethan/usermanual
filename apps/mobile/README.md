# The User Manual Mobile

Native Expo app for The User Manual. It shares the web app's Supabase-backed content, Islands SSO, progress, entitlements, media, downloads, comments, notes, and progress photos through the existing web API.

## Local Setup

```sh
corepack pnpm install
corepack pnpm dev:mobile
```

The app defaults to the production User Manual API and Islands auth endpoint. Override them with Expo public env vars when pointing at a local tunnel or staging deploy:

```sh
EXPO_PUBLIC_USER_MANUAL_API_BASE_URL=https://your-api.example.com \
EXPO_PUBLIC_ISLANDS_AUTHORIZE_URL=https://islands.bio/auth/authorize \
EXPO_PUBLIC_ISLANDS_CLIENT_ID=tutorial-mobile \
corepack pnpm --filter @islands/mobile start
```

## Native Auth Contract

The mobile app opens Islands with:

- `client_id=tutorial-mobile`
- `redirect_uri=usermanual://auth/callback`
- `mode=signin`

The native app never stores the Islands client secret. It sends the returned auth code to the web app at `/api/auth/islands/mobile-token`, and the web app exchanges that code server-side.

The web token endpoints return the access token, refresh token, and expiry timestamp. The native API client refreshes proactively when a stored token is near expiry; if a protected request still returns `401`, it calls `/api/auth/islands/mobile-refresh`, stores the returned token pair, and retries the original request once.

Sign-out clears the stored session, protected sync cache, and queued offline writes. The public content manifest remains cached because it does not contain account data.

## Device Checks

Open Account -> Diagnostics in the app to verify:

- API base URL and Islands redirect settings
- stored access and refresh token presence
- manifest cache and protected sync cache
- current entitlement state
- queued offline writes
- live manifest and protected sync responses
- refresh-token renewal through the web app

Authenticated API smoke checks can also run from the repo root when a web session cookie is available:

```sh
USER_MANUAL_COOKIE='...' corepack pnpm smoke:um
```

To include the local mobile refresh route validation before deployment:

```sh
corepack pnpm smoke:um:mobile-local
```

Mobile checkout opens Stripe in an auth-style browser session. Stripe returns to the web app at `/paid/mobile-return`, and that route redirects back into the app with `usermanual://checkout/success` or `usermanual://checkout/cancel`.

After a successful checkout return, the app stores a pending checkout marker. When the app launches or returns to the foreground, it refreshes the session and re-checks User Manual sync if that marker is present, clearing the marker once entitlement is active.
