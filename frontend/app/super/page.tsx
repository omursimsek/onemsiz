import {getTranslations} from 'next-intl/server';

export default async function SuperPage(){
  const t = await getTranslations('Super');
  return (
    <main style={{padding:24}}>
      <h1>{t('title')}</h1>
      <p>{t('desc')}</p>
    </main>
  );
}
