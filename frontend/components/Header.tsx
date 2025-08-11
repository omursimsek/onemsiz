import Image from 'next/image';
import Link from 'next/link';
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';
import LanguageSwitcher from './LanguageSwitcher';
import {HEADER_HEIGHT} from '../shared/ui';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

async function getTenantInfo() {
  const c = await cookies();
  const token = c.get(PREF + 'token')?.value || c.get('token')?.value;
  const userRaw = c.get(PREF + 'user')?.value || c.get('user')?.value;

  if (!token || !userRaw) return { logoUrl: null as string | null, name: null as string | null, authenticated: false };

  // Tenant yoksa (Super/Staff) global logo kalsın
  let hasTenant = false;
  try {
    const u = JSON.parse(userRaw);
    hasTenant = Boolean(u?.tenantId);
  } catch { /* ignore */ }

  if (!hasTenant) return { logoUrl: null, name: null, authenticated: true };

  // SSR fetch – ilk render'da doğru logo
  const res = await fetch(`${API_BASE}/api/tenant/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!res.ok) return { logoUrl: null, name: null, authenticated: true };

  const data = await res.json();
  return {
    logoUrl: data.logoUrl ?? null,
    name: data.name ?? null,
    authenticated: true
  };
}

export default async function Header() {
  const t = await getTranslations('Common');
  const info = await getTenantInfo();

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:10}}>
          {info.logoUrl ? (
            <img src={info.logoUrl} alt="Tenant Logo" style={{height:32}} />
          ) : (
            <Image src="/logo.svg" alt="Logo" width={32} height={32} priority />
          )}
          <span style={{fontWeight:700, fontSize:18}}>
            {info.name ?? 'B2B SaaS'}
          </span>
        </Link>
      </div>

      <div style={styles.right}>
        <LanguageSwitcher />
        {info.authenticated ? (
          <form action="/api/session/logout" method="post">
            <button type="submit" style={styles.btn}>{t('logout')}</button>
          </form>
        ) : (
          <Link href="/login"><button style={styles.btn}>{t('login') ?? 'Login'}</button></Link>
        )}
      </div>
    </header>
  );
}

const styles: {[k:string]: React.CSSProperties} = {
  header: {
    position:'sticky', top:0, zIndex:50,
    height: HEADER_HEIGHT,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'10px 16px',
    borderBottom:'1px solid #e5e7eb',
    background:'#fff'
  },
  left: { display:'flex', alignItems:'center', gap:12 },
  right: { display:'flex', alignItems:'center', gap:12 },
  btn: {
    border:'1px solid #e5e7eb', background:'#fff',
    padding:'8px 12px', borderRadius:10, cursor:'pointer'
  }
};
