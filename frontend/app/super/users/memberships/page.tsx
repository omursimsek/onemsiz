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
  if (!r.ok) return [];
  return r.json();
}

async function fetchTree(token: string): Promise<Node[]> {
  const r = await fetch(`${API_BASE}/api/platform/tenants/tree`, {
    headers: { Authorization: `Bearer ${token}` }, cache:'no-store'
  });
  if (!r.ok) return [];
  return r.json();
}

export default async function MembershipsPage(){
  const t = await getTranslations('super-users');
  const token = (await cookies()).get(PREF+'token')?.value || '';
  const [users, nodes] = token ? await Promise.all([fetchUsers(token), fetchTree(token)]) : [[],[]];

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">{t('memberships.title')}</h1>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">{t('memberships.assign')}</h3>

        <form
          action="/api/super/users/memberships/assign"
          method="post"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* User */}
          <div>
            <label htmlFor="userId" className="mb-1 block text-sm font-medium text-gray-700">
              {t('memberships.user')}
            </label>
            <select
              id="userId"
              name="userId"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">{t('memberships.user')}</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
          </div>

          {/* Tenant/Node */}
          <div>
            <label htmlFor="tenantId" className="mb-1 block text-sm font-medium text-gray-700">
              {t('memberships.tenant')}
            </label>
            <select
              id="tenantId"
              name="tenantId"
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">{t('memberships.tenant')}</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.slug}) — L{n.level}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
              {t('role') ?? 'Role'}
            </label>
            <select
              id="role"
              name="role"
              required
              defaultValue="TenantUser"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              <option value="TenantUser">{t('roles.TenantUser')}</option>
              <option value="TenantAdmin">{t('roles.TenantAdmin')}</option>
            </select>
          </div>

          {/* IsDefault */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="isDefault"
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-200"
              />
              {t('memberships.isDefault')}
            </label>
          </div>

          {/* Submit */}
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="flex items-center justify-center min-w-[140px] rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {t('actions.create')}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
