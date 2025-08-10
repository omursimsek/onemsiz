import Link from 'next/link';

// Make props optional if you like
export default function SuperNav({headerHeight = 52, width = 240}: {headerHeight?: number; width?: number}) {
  return (
    <aside
      style={{
        position: 'sticky',
        top: headerHeight,                 // ← sits below the Header
        height: `calc(100vh - ${headerHeight}px)`,
        width,
        flex: `0 0 ${width}px`,            // ← fixed width in the flex row
        borderRight: '1px solid #eee',
        background: '#fff',
        zIndex: 10,
        overflowY: 'auto',
        padding: 16,
        boxSizing: 'border-box'
      }}
    >
      <div style={{fontWeight: 700, fontSize: 18, marginBottom: 12}}>Super Admin</div>
      <nav style={{display:'flex', flexDirection:'column', gap:8}}>
        <Link href="/super" style={navItemStyle}>🏠 Dashboard</Link>
        <Link href="/super/users" style={navItemStyle}>👥 Kullanıcı yönetimi</Link>
      </nav>
    </aside>
  );
}

const navItemStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid #f1f5f9',
  background: '#fff',
  textDecoration: 'none',
  color: 'inherit',
  display: 'block'
};
