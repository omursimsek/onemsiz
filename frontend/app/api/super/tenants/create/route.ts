import {NextResponse} from 'next/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

export async function POST(req: Request) {
  const fd = await req.formData();
  const name = String(fd.get('name') || '');
  const slug = String(fd.get('slug') || '');

  const token = (req.headers.get('cookie') || '')
    .split(';').map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url), {status: 303});
  }

  await fetch(`${API_BASE}/api/platform/tenants`, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      Authorization: `Bearer ${decodeURIComponent(token)}`
    },
    body: JSON.stringify({name, slug})
  });

  return NextResponse.redirect(new URL('/super/tenants', req.url), {status: 303});
}
