'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import {useTenantStore} from '../stores/tenantStore';
import {HEADER_HEIGHT} from '../shared/ui';

export default function Header() {
  const t = useTranslations('Common');
  const tenant = useTenantStore(s => s.info);

  // Server-set cookie'yi client'ta doğrudan göremeyiz; header'da logout formunu koruyalım:
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <Link href="/" style={{display:'inline-flex', alignItems:'center', gap:10}}>
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt="Tenant Logo" style={{height:32}} />
          ) : (
            <Image src="/logo.svg" alt="Logo" width={32} height={32} priority />
          )}
          <span style={{fontWeight:700, fontSize:18}}>
            {tenant?.name ?? 'B2B SaaS'}
          </span>
        </Link>
      </div>

      <div style={styles.right}>
        <LanguageSwitcher />
        <form action="/api/session/logout" method="post">
          <button type="submit" style={styles.btn}>{t('logout')}</button>
        </form>
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
