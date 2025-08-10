
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';

export default async function DashboardPage(){
  const t = await getTranslations('Dashboard');
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // Basit sağlık kontrolü: backend korumalı endpoint
  let securePing: string | null = null;
  if (token) {
    try{
      const res = await fetch(`${process.env.API_BASE_INTERNAL}/api/secure/ping`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      securePing = res.ok ? (await res.json()).message : null;
    }catch { /* yoksay */ }
  }

  const userCookie = cookieStore.get('user')?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;

  return (
    <main style={{padding:24}}>
      <h1>Dashboard</h1>
      <h2>{t('hello')}</h2>
      <p>Secure ping: {securePing ?? 'unauthorized'}</p>
      {user && <p>Signed in as: <b>{user.email}</b> ({user.role})</p>}
      <form action="/api/session/logout" method="post" style={{marginTop:16}}>
        <button type="submit">Logout</button>
      </form>
    </main>
  );
}
