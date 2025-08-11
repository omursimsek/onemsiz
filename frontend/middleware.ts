import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

type UserCookie = { email: string; role: string; tenantId?: string|null };

const PREFIX = process.env.APP_COOKIE_PREFIX || 'b2b_';
const TOKEN = PREFIX + 'token';
const USER  = PREFIX + 'user';
const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080'; // 👈 eklendi

// Güvenli parse
function parseUser(v?: string): UserCookie | null {
  if (!v) return null;
  try { return JSON.parse(v); } catch { return null; }
}

// Yetki kuralı
function isAllowed(pathname: string, role?: string|null): boolean {
  if (!role) return false;
  if (pathname.startsWith('/super'))     return role === 'SuperAdmin';
  if (pathname.startsWith('/admin'))     return role === 'TenantAdmin';
  if (pathname.startsWith('/dashboard')) return role === 'TenantAdmin' || role === 'TenantUser';
  // login/public sayfalar serbest
  if (pathname === '/login' || pathname.startsWith('/login/')) return true;
  return true;
}

function roleTarget(role?: string|null) {
  if (role === 'SuperAdmin') return '/super';
  if (role === 'TenantAdmin') return '/admin';
  if (role === 'TenantUser')  return '/dashboard';
  return '/login';
}

export async function middleware(req: NextRequest) { // 👈 async yaptık
  const {pathname} = req.nextUrl;

  // Eski isimli cookie'leri tespit et → temizle
  const hasLegacy = req.cookies.has('token') || req.cookies.has('user');
  if (hasLegacy) {
    const url = req.nextUrl.clone(); url.pathname = '/login';
    const res = NextResponse.redirect(url, {status: 303});
    for (const name of [TOKEN, USER, 'token', 'user']) {
      res.cookies.set(name, '', {path:'/', expires:new Date(0)});
    }
    return res;
  }

  const token = req.cookies.get(TOKEN)?.value;
  const user  = parseUser(req.cookies.get(USER)?.value);

  const isProtected = pathname.startsWith('/dashboard')
                   || pathname.startsWith('/admin')
                   || pathname.startsWith('/super');

  // Giriş gerektiren sayfada token yok → login
  if (isProtected && !token) {
    const url = req.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('r', pathname);
    return NextResponse.redirect(url, {status: 303});
  }

  // Rol uyumsuzluğu → zorunlu logout
  if (isProtected && !isAllowed(pathname, user?.role)) {
    const url = req.nextUrl.clone(); url.pathname = '/login';
    const res = NextResponse.redirect(url, {status: 303});
    for (const name of [TOKEN, USER]) {
      res.cookies.set(name, '', {path:'/', expires:new Date(0)});
    }
    return res;
  }

  // Login sayfasına geldi ama zaten girişli → role hedefine gönder
  const isLogin = pathname === '/login' || pathname.startsWith('/login/');
  if (isLogin && token && user?.role) {
    const url = req.nextUrl.clone(); url.pathname = roleTarget(user.role);
    return NextResponse.redirect(url, {status: 303});
  }

  // --- LOCALE OTOMATİK AYARI (opsiyonel iyileştirme) ---
  const res = NextResponse.next(); // normal akış

  const hasLocale = Boolean(req.cookies.get('locale')?.value);
  if (!hasLocale) {
    // Token varsa tenant defaultCulture'ı çek
    if (token) {
      try {
        const r = await fetch(`${API_BASE}/api/tenant/me`, {
          headers: { Authorization: `Bearer ${token}` },
          // cache: 'no-store'  // istersen ekleyebilirsin
        });
        if (r.ok) {
          const data = await r.json();
          const def = (data?.defaultCulture as string | undefined) || 'en';
          res.cookies.set('locale', def, {
            path: '/',
            httpOnly: false,   // client LanguageSwitcher güncelleyebilsin
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365 // 1 yıl
          });
        }
      } catch {
        // sessiz geç
      }
    }
    // Token yoktu veya fetch başarısızsa güvenli fallback
    /*
    if (!res.cookies.get('locale')) {
      res.cookies.set('locale', 'en', {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365
      });
    }
      */
  }
  // --- /LOCALE ---

  return res;
}

export const config = {
  matcher: ['/login','/dashboard/:path*','/admin/:path*','/super/:path*']
};
