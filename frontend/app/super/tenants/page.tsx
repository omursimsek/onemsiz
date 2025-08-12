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
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">{t('title')}</h1>

      {/* Create form */}
<section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
  <h3 className="mb-3 text-sm font-semibold text-gray-900">{t('createTenant')}</h3>

  <form
    action="/api/super/tenants/create"
    method="post"
    encType="multipart/form-data"
    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
  >
    {/* Name */}
    <div>
      <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
        {t('name')}
      </label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder={t('name')}
        required
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
      />
    </div>

    {/* Slug */}
    <div>
      <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700">
        {t('slug')}
      </label>
      <input
        id="slug"
        name="slug"
        type="text"
        placeholder={t('slug')}
        required
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
      />
    </div>

    {/* Default Culture */}
    <div>
      <label htmlFor="defaultCulture" className="mb-1 block text-sm font-medium text-gray-700">
        {t('language')}
      </label>
      <select
        id="defaultCulture"
        name="defaultCulture"
        defaultValue="en"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
      >
        <option value="en">English</option>
        <option value="tr">Türkçe</option>
      </select>
    </div>

    {/* Logo */}
    <div className="sm:col-span-2 lg:col-span-1">
      <label htmlFor="logo" className="mb-1 block text-sm font-medium text-gray-700">
        {t('logo')}
      </label>
      <input
        id="logo"
        name="logo"
        type="file"
        accept=".png,.svg,.webp"
        className="block w-full rounded-lg border border-gray-300 bg-white text-sm file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-gray-50 file:px-3 file:py-2 file:text-sm file:text-gray-700 hover:file:bg-gray-100"
      />
    </div>

    {/* Submit */}
    <div className="sm:col-span-2 lg:col-span-3">
      <button
        type="submit"
        className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        {t('create')}
      </button>
    </div>
  </form>

  <p className="mt-2 text-xs text-gray-500">
    İLERİDE: plan/limitler, domain/subdomain, özellik bayrakları, faturalama, e-posta ayarları vb.
  </p>
</section>


      {/* List */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {tenants.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed px-4 py-10 text-sm text-gray-500">
            {t('empty') ?? 'No tenants yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">{t('name')}</th>
                  <th className="px-3 py-2">{t('slug')}</th>
                  <th className="px-3 py-2">{t('status')}</th>
                  <th className="px-3 py-2">{t('date')}</th>
                  <th className="px-3 py-2">{t('logo')}</th>
                  <th className="px-3 py-2">{t('language')}</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-900">
                {tenants.map(a => (
                  <tr key={a.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{a.name}</td>
                    <td className="px-3 py-2">{a.slug}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center justify-center rounded-full min-w-[65px] px-2 py-1 text-xs ${
                          a.isActive
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200'
                        }`}
                      >
                        {a.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{new Date(a.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      {a.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.logoUrl} alt="logo" className="h-6 w-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{a.defaultCulture?.toUpperCase() ?? 'EN'}</td>
                    <td className="px-3 py-2 text-right">
                      <form action="/api/super/tenants/toggle" method="post" className="inline">
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="isActive" value={(!a.isActive).toString()} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 min-w-[100px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                          {a.isActive ? t('deactivate') : t('activate')}
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
