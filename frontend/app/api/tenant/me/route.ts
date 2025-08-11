import {NextResponse} from 'next/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

export async function GET(req: Request) {
  const token = (req.headers.get('cookie') || '')
    .split(';').map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];

  if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const res = await fetch(`${API_BASE}/api/tenant/me`, {
    headers: { Authorization: `Bearer ${decodeURIComponent(token)}` },
    cache: 'no-store'
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
