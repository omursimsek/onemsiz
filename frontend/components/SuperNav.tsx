import Link from 'next/link';
import {HEADER_HEIGHT} from './Header';

export default function SuperNav({width=240}:{width?:number}) {
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
      <div style={{fontWeight:700, fontSize:18, marginBottom:12}}>Super Admin</div>
      <nav style={{display:'flex', flexDirection:'column', gap:8}}>
        <Link href="/super" style={navItem}>🏠 Dashboard</Link>
        <Link href="/super/users" style={navItem}>👥 Kullanıcı yönetimi</Link>
        <Link href="/super/tenants" style={navItem}>🏢 Tenant yönetimi</Link>
      </nav>
    </aside>
  );
}

const navItem: React.CSSProperties = {
  padding:'8px 10px', borderRadius:10,
  border:'1px solid #f1f5f9', background:'#fff',
  textDecoration:'none', color:'inherit', display:'block'
};
