import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

// ─── Error class ─────────────────────────────────────────────────────────────
class ApiError extends Error {
  constructor(public readonly message: string, public readonly status: number) {
    super(message);
  }
}

// ─── Response helpers ─────────────────────────────────────────────────────────
export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const created = (data: unknown) => NextResponse.json(data, { status: 201 });

// ─── Error throwers (return never so TypeScript narrows correctly) ────────────
export function badRequest(msg: string): never { throw new ApiError(msg, 400); }
export function unauthorized(msg = 'Unauthorized'): never { throw new ApiError(msg, 401); }
export function forbidden(msg = 'Forbidden'): never { throw new ApiError(msg, 403); }
export function notFound(msg = 'Not found'): never { throw new ApiError(msg, 404); }

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export async function getAuthUser(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) unauthorized();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) unauthorized();
  return user!;
}

export async function requireRole(req: NextRequest, ...roles: string[]) {
  const user = await getAuthUser(req);
  if (roles.length > 0 && !roles.includes(user.role)) forbidden();
  return user;
}

// ─── Handler wrapper ──────────────────────────────────────────────────────────
export function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  return fn().catch((e: unknown) => {
    if (e instanceof ApiError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('[API Error]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  });
}
