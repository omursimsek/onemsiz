import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

type User = { id:string; email:string };
type Node = { id:string; name:string; slug:string; level:number };

async function fetchUsers(token: string): Promise<User[]> {
  const r = await fetch(`${API_BASE}/api/platform/users`, {
    headers: { Authorization: `Bearer ${token}` }, cache:'no-store'
  });
  if (!r.ok) return []; return r.json();
}

async function fetchTree(token: string): Promise<Node[]> {
  const r = await fetch(`${API_BASE}/api/platform/tenants/tree`, {
    headers: { Authorization: `Bearer ${token}` }, cache:'no-store'
  });
  if (!r.ok) return []; return r.json();
}

export default async function MembershipsPage(){
  const t = await getTranslations('super-users');
  const token = (await cookies()).get(PREF+'token')?.value || '';
  const [users, nodes] = token ? await Promise.all([fetchUsers(token), fetchTree(token)]) : [[],[]];

  return (
    <main style={{padding:24}}>
      <h1 style={{marginBottom:16}}>{t('memberships.title')}</h1>

      <section style={{marginBottom:24, border:'1px solid #eee', borderRadius:12, padding:16}}>
        <h3>{t('memberships.assign')}</h3>
        <form action="/api/super/users/memberships/assign" method="post" className="grid-form">
          <select name="userId" required>
            <option value="">{t('memberships.user')}</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
          </select>
          <select name="tenantId" required>
            <option value="">{t('memberships.tenant')}</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.name} ({n.slug}) — L{n.level}</option>)}
          </select>
          <select name="role" required defaultValue="TenantUser">
            <option value="TenantUser">{t('roles.TenantUser')}</option>
            <option value="TenantAdmin">{t('roles.TenantAdmin')}</option>
          </select>
          <label style={{display:'flex', alignItems:'center', gap:8}}>
            <input type="checkbox" name="isDefault" /> {t('memberships.isDefault')}
          </label>
          <button type="submit" className="btn" style={{gridColumn:'1 / -1'}}>{t('actions.create')}</button>
        </form>
      </section>
    </main>
  );
}
