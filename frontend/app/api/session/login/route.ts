import {NextResponse} from 'next/server';
const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREFIX = process.env.APP_COOKIE_PREFIX || 'b2b_';
import {setFlash} from '/lib/flash';

function targetByRole(role?: string|null){
  if (role === 'SuperAdmin') return '/super';
  if (role === 'TenantAdmin') return '/admin';
  return '/dashboard';
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  let email = '', password = '';

  if (contentType.includes('application/json')) {
    const body = await req.json(); email = body?.email || ''; password = body?.password || '';
  } else {
    const fd = await req.formData(); email = String(fd.get('email') || ''); password = String(fd.get('password') || '');
  }

  const backendRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email, password})
  });

  // Başarısızsa login’e geri dön (eski cookie’leri de temizle)
  console.log(backendRes.ok);
  if (!backendRes.ok) {
    const url = new URL('/login', req.url);
    const res = NextResponse.redirect(url, {status: 303});
    // Hem yeni hem de eski isimli cookie’leri temizle
    for (const name of [PREFIX+'token', PREFIX+'user', 'token', 'user']) {
      res.cookies.set(name, '', {path:'/', expires: new Date(0)});
    }
    if (backendRes.status === 401) {
      setFlash(res, { type: 'error', message: 'Invalid email or password' });
    } else {
      setFlash(res, { type: 'error', message: 'Login failed. Please try again.' });
    }
    return res;
  }

  
  const data = await backendRes.json(); // { token, email, role, tenantId }
  const dest = targetByRole(data.role);
  const res = NextResponse.redirect(new URL(dest, req.url), {status: 303});

  res.cookies.set(PREFIX+'token', data.token, {
    httpOnly:true, sameSite:'strict', secure:false, path:'/', maxAge:60*60*8
  });
  res.cookies.set(PREFIX+'user', JSON.stringify({
    email: data.email, role: data.role, tenantId: data.tenantId ?? null
  }), { httpOnly:false, sameSite:'strict', secure:false, path:'/', maxAge:60*60*8 });

  // Eski isimleri de (varsa) sil
  res.cookies.set('token', '', {path:'/', expires:new Date(0)});
  res.cookies.set('user',  '', {path:'/', expires:new Date(0)});

  // Başarılı giriş mesajı
  setFlash(res, { type: 'success', message: 'Login successful!' });


  return res;
}
