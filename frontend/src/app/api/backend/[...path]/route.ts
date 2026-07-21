import { NextRequest, NextResponse } from 'next/server';
import { callLaravel } from '@/lib/server/backend';

/**
 * Thin authenticated proxy to the Laravel API.
 *
 * The client calls same-origin `/api/backend/<path>` (e.g. `tickets`,
 * `tickets/5/status`); this handler forwards the request to Laravel with the
 * bearer token read from the httpOnly cookie, so the token never reaches the
 * browser. Query strings are preserved.
 */
async function forward(request: NextRequest, path: string[]) {
  const search = request.nextUrl.search;
  const target = `/${path.join('/')}${search}`;

  const method = request.method;
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  const res = await callLaravel(target, { method, body });

  // 204 No Content has no body to parse.
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Context) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function POST(request: NextRequest, ctx: Context) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function PATCH(request: NextRequest, ctx: Context) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function DELETE(request: NextRequest, ctx: Context) {
  const { path } = await ctx.params;
  return forward(request, path);
}
