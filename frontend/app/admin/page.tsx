import {getTranslations} from 'next-intl/server';

export default async function AdminPage(){
  const t = await getTranslations('Admin');
  return (
    <main style={{padding:24}}>
      <h1>{t('title')}</h1>
      <p>{t('desc')}</p>
    </main>
  );
}
