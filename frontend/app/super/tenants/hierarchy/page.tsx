import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

type Node = { id:string; name:string; slug:string; level:number; parentId?:string|null; path?:string|null; defaultCulture:string; isActive:boolean };

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
    <main style={{padding:24}}>
      <h1 style={{marginBottom:16}}>{t('hierarchy.title')}</h1>

      <section style={{marginBottom:24, border:'1px solid #eee', borderRadius:12, padding:16}}>
        <h3>{t('hierarchy.createNode')}</h3>
        <form action="/api/super/tenants/node/create" method="post" className="grid-form">
          <input name="name" placeholder={t('form.name')} required />
          <input name="slug" placeholder={t('form.slug')} required />
          <select name="level" defaultValue={0}>
            <option value={0}>{t('level.organization')}</option>
            <option value={1}>{t('level.country')}</option>
            <option value={2}>{t('level.office')}</option>
          </select>
          <select name="parentId" defaultValue="">
            <option value="">{t('form.parent.none')}</option>
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.slug}) — L{n.level}
              </option>
            ))}
          </select>
          <select name="defaultCulture" defaultValue="en">
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          </select>
          <button type="submit" className="btn" style={{gridColumn:'1 / -1'}}>{t('actions.create')}</button>
        </form>
      </section>

      <section>
        <h3>{t('hierarchy.tree')}</h3>
        {roots.length === 0 ? <p>{t('hierarchy.empty')}</p> : (
          <ul>
            {roots.map(r => (
              <li key={r.id}>
                <strong>{r.name}</strong> ({r.slug}) — L{r.level}
                <ul>
                  {nodes.filter(n => n.parentId === r.id).map(c1 => (
                    <li key={c1.id}>
                      {c1.name} ({c1.slug}) — L{c1.level}
                      <ul>
                        {nodes.filter(n => n.parentId === c1.id).map(c2 => (
                          <li key={c2.id}>{c2.name} ({c2.slug}) — L{c2.level}</li>
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
