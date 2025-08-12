import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

type Node = {
  id:string; name:string; slug:string; level:number;
  parentId?:string|null; path?:string|null;
  defaultCulture:string; isActive:boolean
};

async function fetchTree(token: string): Promise<Node[]> {
  const r = await fetch(`${API_BASE}/api/platform/tenants/tree`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!r.ok) return [];
  return r.json();
}

export default async function TenantHierarchyPage(){
  const t = await getTranslations('super-tenants');
  const token = (await cookies()).get(PREF+'token')?.value || '';
  const nodes = token ? await fetchTree(token) : [];
  const roots = nodes.filter(n => !n.parentId);

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">{t('hierarchy.title')}</h1>

      {/* Create node */}
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">{t('hierarchy.createNode')}</h3>

        <form
          action="/api/super/tenants/node/create"
          method="post"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              {t('form.name')}
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder={t('form.name')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700">
              {t('form.slug')}
            </label>
            <input
              id="slug"
              name="slug"
              required
              placeholder={t('form.slug')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="mb-1 block text-sm font-medium text-gray-700">
              {t('level.title') ?? 'Level'}
            </label>
            <select
              id="level"
              name="level"
              defaultValue={0}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              <option value={0}>{t('level.organization')}</option>
              <option value={1}>{t('level.country')}</option>
              <option value={2}>{t('level.office')}</option>
            </select>
          </div>

          {/* Parent */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="parentId" className="mb-1 block text-sm font-medium text-gray-700">
              {t('form.parent.title') ?? 'Parent'}
            </label>
            <select
              id="parentId"
              name="parentId"
              defaultValue=""
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              <option value="">{t('form.parent.none')}</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.slug}) — L{n.level}
                </option>
              ))}
            </select>
          </div>

          {/* Default culture */}
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

      {/* Tree */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">{t('hierarchy.tree')}</h3>

        {roots.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-10 text-sm text-gray-500">
            {t('hierarchy.empty')}
          </div>
        ) : (
          <ul className="space-y-3">
            {roots.map(r => (
              <li key={r.id} className="rounded-xl border border-gray-100 bg-white p-3">
                <NodeRow node={r} />

                {/* level 1 */}
                <ul className="ml-4 mt-2 space-y-2 border-l border-gray-100 pl-4">
                  {nodes.filter(n => n.parentId === r.id).map(c1 => (
                    <li key={c1.id}>
                      <NodeRow node={c1} />

                      {/* level 2 */}
                      <ul className="ml-4 mt-2 space-y-1 border-l border-gray-100 pl-4">
                        {nodes.filter(n => n.parentId === c1.id).map(c2 => (
                          <li key={c2.id}>
                            <NodeRow node={c2} />
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function NodeRow({node}:{node:Node}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium text-gray-900">{node.name}</span>
        <span className="truncate text-xs text-gray-500">({node.slug})</span>
        <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
          L{node.level}
        </span>
      </div>
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${
          node.isActive
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
            : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200'
        }`}
      >
        {node.isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}
