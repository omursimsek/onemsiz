import {getTranslations} from 'next-intl/server';
import {cookies} from 'next/headers';

const flash = (await cookies()).get('flash')?.value;

{flash === 'tenant_required' && <p style={{color:'crimson'}}>TenantAdmin/TenantUser için tenant seçimi zorunlu.</p>}
{flash === 'tenant_not_allowed' && <p style={{color:'crimson'}}>Staff/SuperAdmin için tenant seçmeyin.</p>}
{flash === 'create_error' && <p style={{color:'crimson'}}>Kullanıcı oluşturulamadı.</p>}

export default async function SuperPage(){
  const t = await getTranslations('Super');
  return (
    <main style={{padding:24}}>
      <h1>{t('title')}</h1>
      <p>{t('desc')}</p>
    </main>
  );
}
