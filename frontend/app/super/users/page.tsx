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
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">{t('title')}</h1>

      {/* Oluşturma formu */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">{t('createUser')}</h3>
        {/* Not: TenantRoleForm kendi içinde client-side; form alanları orada. */}
        <TenantRoleForm tenants={tenants} />
      </section>

      {/* Liste */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {users.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed px-4 py-10 text-sm text-gray-500">
            {t('empty') ?? 'No users yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">{t('email')}</th>
                  <th className="px-3 py-2">{t('role')}</th>
                  <th className="px-3 py-2">{t('tenant')}</th>
                  <th className="px-3 py-2">{t('status')}</th>
                  <th className="px-3 py-2">{t('date')}</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-900">
                {users.map(u => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">{u.role}</td>
                    <td className="px-3 py-2">{u.tenantName ?? <span className="text-gray-400">—</span>}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center justify-center min-w-[65px] rounded-full px-2 py-1 text-xs ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
                        }`}
                      >
                        {u.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <form action="/api/super/users/toggle" method="post" className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="isActive" value={(!u.isActive).toString()} />
                        <button
                          type="submit"
                          className="flex items-center justify-center min-w-[100px] rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                          {u.isActive ? t('deactivate') : t('activate')}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
