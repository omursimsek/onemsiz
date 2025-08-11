import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {HEADER_HEIGHT, SIDEBAR_WIDTH} from '../shared/ui';

export default async function SuperNav({width = SIDEBAR_WIDTH}:{width?:number}) {
  const t = await getTranslations('super-nav');

  return (
    <aside
      style={{
        position:'sticky',
        top: HEADER_HEIGHT,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        width, flex: `0 0 ${width}px`,
        borderRight:'1px solid #eee', background:'#fff',
        zIndex: 10, overflowY:'auto', padding:16, boxSizing:'border-box'
      }}
    >
      <div style={{fontWeight:700, fontSize:18, marginBottom:12}}>
        {t('title')}
      </div>
      <nav style={{display:'flex', flexDirection:'column', gap:8}}>
        <Link href="/super" style={navItem}>🏠 {t('dashboard')}</Link>
        <Link href="/super/users" style={navItem}>👥 {t('users')}</Link>
        <Link href="/super/tenants" style={navItem}>🏢 {t('tenants')}</Link>
      </nav>
    </aside>
  );
}

const navItem: React.CSSProperties = {
  padding:'8px 10px', borderRadius:10,
  border:'1px solid #f1f5f9', background:'#fff',
  textDecoration:'none', color:'inherit', display:'block'
};
