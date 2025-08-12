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
  const userId = String(fd.get('userId') || '');
  const tenantId = String(fd.get('tenantId') || '');
  const role = String(fd.get('role') || 'TenantUser');
  const isDefault = fd.getAll('isDefault').length > 0; // checkbox

  const token = (await cookies()).get(PREF+'token')?.value;
  const redirectTo = new URL('/super/users/memberships', req.url);
  const res = NextResponse.redirect(redirectTo, {status: 303});

  if (!token) {
    setFlash(res, 'error', 'Unauthorized');
    return res;
  }

  try {
    const r = await fetch(`${API_BASE}/api/platform/users/memberships`, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, tenantId, role, isDefault })
    });

    if (!r.ok) {
      const body = await r.json().catch(()=>({}));
      setFlash(res, 'error', body?.message || 'Assign failed');
      return res;
    }

    setFlash(res, 'success', 'Membership assigned');
    return res;
  } catch {
    setFlash(res, 'error', 'Server unreachable');
    return res;
  }
}
