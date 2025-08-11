import {cookies} from 'next/headers';
import TenantRoleForm from '../../../components/TenantRoleForm';
import {getTranslations} from 'next-intl/server';


const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

type UserRow = {
  id: string; email: string; role: string; isActive: boolean;
  createdAt: string; tenantId?: string | null; tenantName?: string | null;
};

type TenantRow = { id:string; name:string; slug:string; isActive:boolean; createdAt:string };


async function fetchUsers(token: string): Promise<UserRow[]> {
  const res = await fetch(`${API_BASE}/api/platform/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

async function fetchTenants(token: string): Promise<TenantRow[]> {
   const res = await fetch(`${API_BASE}/api/platform/tenants`, {
     headers: { Authorization: `Bearer ${token}` },
     cache: 'no-store'
   });
   if (!res.ok) return [];
   return res.json();
}

export default async function SuperUsersPage(){
  const token = (await cookies()).get(PREF+'token')?.value || '';
  const users = token ? await fetchUsers(token) : [];
  const tenants = token ? await fetchTenants(token) : [];

  const t = await getTranslations('super-users');

  return (
    <main style={{padding:24}}>
      <h1 style={{marginBottom:16}}>{t('title')}</h1>

      {/* Oluşturma formu: route handler'a post eder */}
      <section style={{marginBottom:24, border:'1px solid #eee', borderRadius:12, padding:16}}>
        <h3>{t('createUser')}</h3>
        <TenantRoleForm tenants={tenants} />
      </section>

      {/* Liste */}
      <section>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th align="left">{t('email')}</th>
              <th align="left">{t('role')}</th>
              <th align="left">{t('tenant')}</th>
              <th align="left">{t('status')}</th>
              <th align="left">{t('date')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{borderTop:'1px solid #eee'}}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.tenantName ?? '—'}</td>
                <td>{u.isActive ? t('active') : t('inactive')}</td>
                <td>{new Date(u.createdAt).toLocaleString()}</td>
                <td style={{textAlign:'right'}}>
                  <form action="/api/super/users/toggle" method="post" style={{display:'inline'}}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="isActive" value={(!u.isActive).toString()} />
                    <button type="submit">{u.isActive ? t('deactivate') : t('activate')}</button>
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
