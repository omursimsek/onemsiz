'use client';
import { useEffect } from 'react';
import { useTenantStore } from '../stores/tenantStore';

export default function TenantBootstrap() {
  const setInfo = useTenantStore(s => s.setInfo);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/tenant/me', { cache: 'no-store' });
        if (!res.ok) { setInfo(null); return; } // 401/403 → tenant değil
        const data = await res.json();
        if (!aborted) setInfo({
          id: data.id, name: data.name, slug: data.slug,
          defaultCulture: data.defaultCulture ?? null,
          logoUrl: data.logoUrl ?? null
        });
      } catch { /* yut */ }
    })();
    return () => { aborted = true; };
  }, [setInfo]);

  return null; // sadece store’u dolduruyor
}
