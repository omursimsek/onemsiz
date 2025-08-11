import Image from 'next/image';
import Link from 'next/link';
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';
import LanguageSwitcher from './LanguageSwitcher';

export const HEADER_HEIGHT = 56; // SuperNav'ta da kullanacağız

export default async function Header() {
  const t = await getTranslations('Common');
  const pref = process.env.APP_COOKIE_PREFIX || 'b2b_';
  const cookieStore = await cookies();
  const hasToken = Boolean(
    cookieStore.get(pref + 'token')?.value || cookieStore.get('token')?.value
  );

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:10}}>
          {/* Logonu /public/logo.svg veya /public/logo.png olarak koy */}
          <Image src="/logo.svg" alt="Logo" width={32} height={32} priority />
          <span style={{fontWeight:700, fontSize:18}}>B2B SaaS</span>
        </Link>
      </div>

      <div style={styles.right}>
        <LanguageSwitcher />
        {hasToken && (
          <form action="/api/session/logout" method="post">
            <button type="submit" style={{...styles.btn, color:'black'}}>{t('logout')}</button>
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
