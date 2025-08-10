import {NextResponse} from 'next/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

export async function POST(req: Request) {
  const fd = await req.formData();
  const email = String(fd.get('email') || '');
  const password = String(fd.get('password') || '');
  const role = String(fd.get('role') || 'TenantUser');
  const tenantId = fd.get('tenantId') ? String(fd.get('tenantId')) : null;

  const token = (req.headers.get('cookie') || '')
    .split(';')
    .map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url), {status: 303});
  }

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      Authorization: `Bearer ${decodeURIComponent(token)}`
    },
    body: JSON.stringify({email, password, role, tenantId})
  });

  const back = NextResponse.redirect(new URL('/super/users', req.url), {status: 303});
  if (!res.ok) back.cookies.set('flash', 'create_error', {path:'/', maxAge:5});
  return back;
}
