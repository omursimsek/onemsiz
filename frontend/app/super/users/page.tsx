import {cookies} from 'next/headers';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

type UserRow = {
  id: string; email: string; role: string; isActive: boolean;
  createdAt: string; tenantId?: string | null; tenantName?: string | null;
};

async function fetchUsers(token: string): Promise<UserRow[]> {
  const res = await fetch(`${API_BASE}/api/platform/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function SuperUsersPage(){
  const token = (await cookies()).get(PREF+'token')?.value || '';
  const users = token ? await fetchUsers(token) : [];

  return (
    <main style={{padding:24}}>
      <h1 style={{marginBottom:16}}>Kullanıcı yönetimi</h1>

      {/* Oluşturma formu: route handler'a post eder */}
      <section style={{marginBottom:24, border:'1px solid #eee', borderRadius:12, padding:16}}>
        <h3>Yeni kullanıcı oluştur</h3>
        <form action="/api/super/users/create" method="post" style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12}}>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="text" placeholder="Geçici şifre" required />
          <select name="role" defaultValue="TenantUser">
            <option value="TenantUser">TenantUser</option>
            <option value="TenantAdmin">TenantAdmin</option>
            <option value="Staff">Staff</option>
            <option value="SuperAdmin">SuperAdmin</option>
          </select>
          <input name="tenantId" type="text" placeholder="TenantId (tenant user ise zorunlu)" />
          <button type="submit" style={{gridColumn:'1 / -1'}}>Oluştur</button>
        </form>
      </section>

      {/* Liste */}
      <section>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th align="left">Email</th>
              <th align="left">Rol</th>
              <th align="left">Tenant</th>
              <th align="left">Durum</th>
              <th align="left">Tarih</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{borderTop:'1px solid #eee'}}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.tenantName ?? '—'}</td>
                <td>{u.isActive ? 'Aktif' : 'Pasif'}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td style={{textAlign:'right'}}>
                  <form action="/api/super/users/toggle" method="post" style={{display:'inline'}}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="isActive" value={(!u.isActive).toString()} />
                    <button type="submit">{u.isActive ? 'Pasifleştir' : 'Aktifleştir'}</button>
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
