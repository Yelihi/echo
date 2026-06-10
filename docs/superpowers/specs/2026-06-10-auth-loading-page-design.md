# Auth Loading Page Design

## Goal

Show a full-page loading state while Google OAuth is in progress, instead of relying on a button spinner that disappears once the browser leaves the login page.

## Selected Flow

1. The login button navigates to `/auth/loading?provider=google&next=/home`.
2. `/auth/loading` renders a dedicated loading page and starts Supabase OAuth on the client.
3. Supabase redirects the browser to `/auth/callback?next=/home` after Google auth.
4. `/auth/callback` exchanges the auth code through `/api/auth/callback`.
5. The browser lands on `/home` after the session cookie is set.

## Alternatives Considered

- Keep the button spinner only: simplest, but the state is too brief and does not cover the browser redirect.
- Use the existing `/auth/callback` page only: covers the return from Google, but does not show the first outbound transition.
- Add a dedicated `/auth/loading` page: gives the user a stable intermediate state before leaving for Google and keeps callback behavior focused on session completion.

## Components And Routes

- `LoginButton` only routes to the loading page and no longer owns OAuth execution state.
- `AuthLoadingPage` validates the `provider` query, shows the loading UI, and calls Supabase OAuth once.
- `AuthCallbackPage` handles the return from Google and explicitly navigates to the API route so the server redirect updates the browser location.
- `/api/auth/callback` remains the server-only session exchange endpoint.

## Error Handling

If the loading page receives an unsupported provider or Supabase returns an OAuth start error, it shows an error message with a way back to `/login`. If the callback lacks a code, it shows an invalid access message instead of looping.

## Verification

- TypeScript should pass with `npm run typecheck`.
- Lint should pass with `npm run lint`.
- Login button click should route to `/auth/loading`.
- Successful OAuth callback should end at `/home`.
