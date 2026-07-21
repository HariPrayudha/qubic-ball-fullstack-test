import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { callLaravel, TOKEN_COOKIE } from '@/lib/server/backend';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setTokenCookie(store: Awaited<ReturnType<typeof cookies>>, token: string) {
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Log in: exchange credentials for a token stored in an httpOnly cookie. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const res = await callLaravel('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
    auth: false,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const store = await cookies();
  setTokenCookie(store, data.token);

  return NextResponse.json({ user: data.data }, { status: 200 });
}

/** Return the currently authenticated user (used to bootstrap the client). */
export async function GET() {
  const res = await callLaravel('/auth/me');

  if (!res.ok) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const data = await res.json();
  return NextResponse.json({ user: data.data }, { status: 200 });
}

/** Log out: revoke the token on the API and clear the cookie. */
export async function DELETE() {
  await callLaravel('/auth/logout', { method: 'POST' }).catch(() => null);

  const store = await cookies();
  store.delete(TOKEN_COOKIE);

  return new NextResponse(null, { status: 204 });
}
