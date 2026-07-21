import { cookies } from 'next/headers';

/**
 * Server-only helpers for talking to the Laravel API.
 *
 * The Sanctum token lives in an httpOnly cookie that client JavaScript cannot
 * read, so every authenticated call is made from the server (route handlers)
 * where the cookie is available. This keeps the token out of reach of XSS.
 */

export const TOKEN_COOKIE = 'qubic_token';

/** Base URL of the Laravel API, e.g. http://localhost:8000/api */
export const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? 'http://localhost:8000/api';

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}

/**
 * Call the Laravel API. Attaches the bearer token from the cookie unless
 * `auth: false` is passed (used for login/register).
 */
export async function callLaravel(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<Response> {
  const { auth = true, headers, ...rest } = init;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');
  if (!finalHeaders.has('Content-Type') && rest.body) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = await getToken();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${LARAVEL_API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    cache: 'no-store',
  });
}
