import {cookies} from 'next/headers';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

type TenantRow = {
  id: string; name: string; slug: string;
  isActive: boolean; createdAt: string;
};

async function fetchTenants(token: string): Promise<TenantRow[]> {
  const res = await fetch(`${API_BASE}/api/platform/tenants`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function SuperTenantsPage(){
  const token = (await cookies()).get(PREF+'token')?.value || '';
  const tenants = token ? await fetchTenants(token) : [];

  return (
    <main style={{padding:24}}>
      <h1 style={{marginBottom:16}}>Tenant yönetimi</h1>

      {/* Oluşturma formu */}
      <section style={{marginBottom:24, border:'1px solid #eee', borderRadius:12, padding:16}}>
        <h3>Yeni tenant oluştur</h3>
        <form action="/api/super/tenants/create" method="post" style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:12}}>
          <input name="name" type="text" placeholder="Tenant adı" required />
          <input name="slug" type="text" placeholder="Slug (ör. acme)" required />
          <button type="submit">Oluştur</button>
        </form>
        <p style={{marginTop:8, fontSize:12, color:'#64748b'}}>
          İLERİDE: plan/limitler, domain/subdomain, özellik bayrakları, faturalama, e-posta ayarları vb.
        </p>
      </section>

      {/* Liste */}
      <section>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th align="left">Ad</th>
              <th align="left">Slug</th>
              <th align="left">Durum</th>
              <th align="left">Oluşturma</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} style={{borderTop:'1px solid #eee'}}>
                <td>{t.name}</td>
                <td>{t.slug}</td>
                <td>{t.isActive ? 'Aktif' : 'Pasif'}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td style={{textAlign:'right'}}>
                  <form action="/api/super/tenants/toggle" method="post" style={{display:'inline'}}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="isActive" value={(!t.isActive).toString()} />
                    <button type="submit">{t.isActive ? 'Pasifleştir' : 'Aktifleştir'}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
