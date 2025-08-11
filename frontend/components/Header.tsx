import Image from 'next/image';
import Link from 'next/link';
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';
import LanguageSwitcher from './LanguageSwitcher';

export const HEADER_HEIGHT = 56;

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

async function getTenantLogoUrl() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PREF + 'token')?.value || cookieStore.get('token')?.value;
  const userRaw = cookieStore.get(PREF + 'user')?.value || cookieStore.get('user')?.value;

  if (!token || !userRaw) return null;
  console.log('Fetching tenant logo with token:', token);

  // User cookie’den tenantId var mı diye bak (role SuperAdmin/Staff ise olmayabilir)
  try {
    const u = JSON.parse(userRaw);
    console.log('User data:', u);
    if (!u?.tenantId) return null;
  } catch { return null; }

  // Server-side fetch ile logo url al
  const res = await fetch(`${API_BASE}/api/tenant/me`, {
    headers: { Authorization: `Bearer ${token}` },
    // tenant logosu değişirse anında görünsün istersen:
    cache: 'no-store'
  });
    console.log('Tenant logo fetch response:', res.status, res.statusText);
  if (!res.ok) return null;

  const data = await res.json(); // { logoUrl, ... }
  console.log('Tenant logo URL:', data.logoUrl);
  return data.logoUrl as string | null;
}

export default async function Header() {
  const t = await getTranslations('Common');

  const cookieStore = await cookies();
  const hasToken = Boolean(
    cookieStore.get(PREF + 'token')?.value || cookieStore.get('token')?.value
  );

  const tenantLogoUrl = await getTenantLogoUrl();

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:10}}>
          {/* Tenant logosu varsa onu göster, yoksa global logo */}
          {tenantLogoUrl ? (
            // Harici URL olduğundan next/image yerine img daha pratik
            <img src={tenantLogoUrl} alt="Tenant Logo" style={{height:32}} />
          ) : (
            <Image src="/logo.svg" alt="Logo" width={32} height={32} priority />
          )}
          <span style={{fontWeight:700, fontSize:18}}>B2B SaaS</span>
        </Link>
      </div>

      <div style={styles.right}>
        <LanguageSwitcher />
        {hasToken && (
          <form action="/api/session/logout" method="post">
            <button type="submit" style={styles.btn}>{t('logout')}</button>
          </form>
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
