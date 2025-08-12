/*
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';
import Toast from '/components/Toast';

export default async function DashboardPage(){
  const t = await getTranslations('Dashboard');
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const flashRaw = (await cookies()).get('flash')?.value || null;
  const flash = flashRaw ? JSON.parse(flashRaw) : null;

  // Basit sağlık kontrolü: backend korumalı endpoint
  let securePing: string | null = null;
  if (token) {
    try{
      const res = await fetch(`${process.env.API_BASE_INTERNAL}/api/secure/ping`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      securePing = res.ok ? (await res.json()).message : null;
    }catch { /* yoksay *//* }
  }

  const userCookie = cookieStore.get('user')?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;

  return (
    <main style={{padding:24}}>
      <Toast initial={flash} />
      <h1>{t('title')}</h1>
      <h2>{t('hello')}</h2>
      <p>{t('securePing')}: {securePing ?? 'unauthorized'}</p>
      {user && <p>{t('signedInAs')}: <b>{user.email}</b> ({user.role})</p>}
      <form action="/api/session/logout" method="post" style={{marginTop:16}}>
        <button type="submit">{t('logout')}</button>
      </form>
    </main>
  );
}
*/

// app/dashboard/page.tsx
import CustomerPortalShell from '/components/portal/CustomerPortalShell';

export default async function DashboardPage() {
  // Header zaten global (server) olduğu için iç header’ı kapatıyoruz
  return (
    <main className="p-4">
      <CustomerPortalShell showInnerHeader={false} />
    </main>
  );
}
