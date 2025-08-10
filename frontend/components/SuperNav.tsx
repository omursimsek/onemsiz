import Link from 'next/link';
import {useLocale} from 'next-intl';

export default function SuperNav(){
  const locale = useLocale();
  return (
    <aside style={styles.aside}>
      <div style={styles.brand}>Super Admin</div>
      <nav style={styles.nav}>
        <Link href="/super" style={styles.item}>🏠 Dashboard</Link>
        <Link href="/super/users" style={styles.item}>👥 Kullanıcı yönetimi</Link>
        {/* ileride: Tenants, Logs, Plans vs. */}
      </nav>
      <div style={styles.locale}>lang: {locale}</div>
    </aside>
  );
}

const styles: {[k:string]: React.CSSProperties} = {
  aside: {width: 240, borderRight:'1px solid #eee', padding:16, display:'flex', flexDirection:'column', gap:12, minHeight:'calc(100vh - 52px)'},
  brand: {fontWeight:700, fontSize:18},
  nav: {display:'flex', flexDirection:'column', gap:8},
  item: {padding:'8px 10px', borderRadius:10, border:'1px solid #f1f5f9', background:'#fff'},
  locale: {marginTop:'auto', fontSize:12, color:'#64748b'}
};
