import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { callLaravel, TOKEN_COOKIE } from '@/lib/server/backend';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Register a new user and start a session. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const res = await callLaravel('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
    auth: false,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const store = await cookies();
  store.set(TOKEN_COOKIE, data.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return NextResponse.json({ user: data.data }, { status: 201 });
}
