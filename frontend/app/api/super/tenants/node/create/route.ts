import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

function setFlash(res: NextResponse, type: 'success'|'error', message: string){
  res.cookies.set('flash', JSON.stringify({type, message}), {
    path: '/', httpOnly: false, sameSite: 'lax', maxAge: 8
  });
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const name = String(fd.get('name') || '').trim();
  const slug = String(fd.get('slug') || '').trim();
  const level = Number(fd.get('level') || 0);
  const parentId = String(fd.get('parentId') || '') || null;
  const defaultCulture = String(fd.get('defaultCulture') || 'en');

  const token = (await cookies()).get(PREF+'token')?.value;
  const redirectTo = new URL('/super/tenants/hierarchy', req.url);
  const res = NextResponse.redirect(redirectTo, {status: 303});

  if (!token) {
    setFlash(res, 'error', 'Unauthorized');
    return res;
  }

  try {
    const r = await fetch(`${API_BASE}/api/platform/tenants/node`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, slug, level, parentId, DefaultCulture: defaultCulture })
    });

    if (!r.ok) {
      const body = await r.json().catch(()=>({}));
      setFlash(res, 'error', body?.message || 'Create failed');
      return res;
    }

    setFlash(res, 'success', 'Tenant node created');
    return res;
  } catch {
    setFlash(res, 'error', 'Server unreachable');
    return res;
  }
}
