import {NextResponse} from 'next/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

export async function POST(req: Request) {
  const fd = await req.formData();
  const name = String(fd.get('name') || '');
  const slug = String(fd.get('slug') || '');
  const defaultCulture = String(fd.get('defaultCulture') || 'en');
  const logo = fd.get('logo') as File | null;

  const token = (req.headers.get('cookie') || '')
    .split(';').map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];

  if (!token) return NextResponse.redirect(new URL('/login', req.url), {status: 303});

  // 1) Tenant oluştur
  const createRes = await fetch(`${API_BASE}/api/platform/tenants`, {
    method: 'POST',
    headers: {'Content-Type':'application/json', Authorization:`Bearer ${decodeURIComponent(token)}`},
    body: JSON.stringify({name, slug, defaultCulture})
  });

  if (!createRes.ok) {
    const back = NextResponse.redirect(new URL('/super/tenants', req.url), {status: 303});
    back.cookies.set('flash','tenant_create_error',{path:'/',maxAge:5});
    return back;
  }
  const created = await createRes.json(); // { id, ... }

  // 2) Logo varsa upload et
  if (logo && logo.size > 0) {
    const form = new FormData();
    form.set('file', logo, logo.name);
    await fetch(`${API_BASE}/api/platform/tenants/${created.id}/logo`, {
      method: 'POST',
      headers: { Authorization:`Bearer ${decodeURIComponent(token)}` },
      body: form
    });
  }

  return NextResponse.redirect(new URL('/super/tenants', req.url), {status: 303});
}
