import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

type TenantRow = {
  id: string; name: string; slug: string;
  isActive: boolean; createdAt: string; defaultCulture: string; logoUrl: string | null;
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

  const t = await getTranslations('super-tenants');

  return (
    <main style={{padding:24}}>
      <h1 style={{marginBottom:16}}>{t('title')}</h1>

      {/* Oluşturma formu */}
      <section style={{marginBottom:24, border:'1px solid #eee', borderRadius:12, padding:16}}>
        <h3>{t('createTenant')}</h3>
        <form action="/api/super/tenants/create" method="post" encType="multipart/form-data" style={{display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:12}}>
          <input name="name" type="text" placeholder={t('name')} required />
          <input name="slug" type="text" placeholder={t('slug')} required />
          {/* Varsayılan dil */}
          <select name="defaultCulture" defaultValue="en">
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          {/* ileride: de, fr, ... */}
          </select>
          {/* Logo dosyası */}
          <input name="logo" type="file" accept=".png,.svg,.webp" />
          <button type="submit">{t('create')}</button>
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
              <th align="left">{t('name')}</th>
              <th align="left">{t('slug')}</th>
              <th align="left">{t('status')}</th>
              <th align="left">{t('date')}</th>
              <th align="left">{t('logo')}</th>
              <th align="left">{t('language')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(a => (
              <tr key={a.id} style={{borderTop:'1px solid #eee'}}>
                <td>{a.name}</td>
                <td>{a.slug}</td>
                <td>{a.isActive ? t('active') : t('inactive')}</td>
                <td>{new Date(a.createdAt).toLocaleString()}</td>
                <td>
                    {a.logoUrl ? <img src={a.logoUrl} alt="logo" style={{height:24}}/> : '—'}
                </td>
                <td>{a.defaultCulture?.toUpperCase() ?? 'EN'}</td>
                <td style={{textAlign:'right'}}>
                  <form action="/api/super/tenants/toggle" method="post" style={{display:'inline'}}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="isActive" value={(!a.isActive).toString()} />
                    <button type="submit">{a.isActive ? t('deactivate') : t('activate')}</button>
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
