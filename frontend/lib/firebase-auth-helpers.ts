/**
 * frontend/lib/firebase-auth-helpers.ts
 * ─────────────────────────────────────────
 * Thin helpers around Firebase Auth that are safe to call from anywhere
 * (server components, client components, API client). Every helper returns
 * a Promise so the auto-refresh path in `getIdToken(true)` is honoured.
 *
 * These helpers DO NOT replace `auth-context.tsx` — they are used by code
 * that needs the raw ID token without subscribing to React state (e.g. the
 * fetch wrapper that adds `Authorization: Bearer <token>` to backend calls).
 */

import { auth } from "./firebase";

/**
 * Resolve the current Firebase ID token, or `null` if the user is signed out.
 * Setting `forceRefresh=true` skips the SDK cache and re-issues a fresh token
 * — use sparingly (e.g. after a 401 response) to avoid extra round-trips.
 */
export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

/**
 * Same as `getCurrentIdToken` but throws when there is no signed-in user.
 * Use in code paths where unauthenticated access is a programmer error
 * (e.g. inside an authenticated dashboard route's data fetch).
 */
export async function requireIdToken(forceRefresh = false): Promise<string> {
  const token = await getCurrentIdToken(forceRefresh);
  if (!token) {
    throw new Error("Not authenticated — no Firebase ID token available.");
  }
  return token;
}

/**
 * Returns the current Firebase UID or `null`. Cheap synchronous accessor;
 * does not touch the network.
 */
export function getCurrentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}
