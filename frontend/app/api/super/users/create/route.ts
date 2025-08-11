import {NextResponse} from 'next/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';
const AppRole = { SuperAdmin:0, Staff:1, TenantAdmin:2, TenantUser:3 } as const;

const isTenantRole = (r:number) => r === AppRole.TenantAdmin || r === AppRole.TenantUser;

export async function POST(req: Request) {
  const fd = await req.formData();
  const email = String(fd.get('email') || '');
  const password = String(fd.get('password') || '');
  const role = Number(fd.get('role') ?? AppRole.TenantUser);
  const tenantId = fd.get('tenantId') ? String(fd.get('tenantId')) : null;
  const tenantIdVal = fd.get('tenantId');
  

  console.log(isTenantRole(role), tenantId);

  // Sunucu validasyonu
  if (isTenantRole(role) && !tenantId) {
    const back = NextResponse.redirect(new URL('/super/users', req.url), {status: 303});
    back.cookies.set('flash', 'tenant_required', {path:'/', maxAge:5});
    return back;
  }
  if (!isTenantRole(role) && tenantId) {
    // Platform rolleri için tenant gönderilmemeli
    const back = NextResponse.redirect(new URL('/super/users', req.url), {status: 303});
    back.cookies.set('flash', 'tenant_not_allowed', {path:'/', maxAge:5});
    return back;
  }

  // Token
  const token = (req.headers.get('cookie') || '')
    .split(';').map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];


  console.log('Token:', token);
    
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url), {status: 303});
  }

  // Backend'e ilet
  const body = JSON.stringify({ email, password, role, tenantId });
  console.log('Body:', body);
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', Authorization: `Bearer ${decodeURIComponent(token)}` },
    body
  });
  console.log('Response:', res.ok, res.status);

  const back = NextResponse.redirect(new URL('/super/users', req.url), {status: 303});
  if (!res.ok) back.cookies.set('flash', 'create_error', {path:'/', maxAge:5});
  return back;
}
