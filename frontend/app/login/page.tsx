import {useTranslations} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

export default async function LoginPage(){
  // Eğer zaten girişliyse, role hedefine atla (isteğe bağlı güvenlik)
  const pref = process.env.APP_COOKIE_PREFIX || 'b2b_';
  const token = (await cookies()).get(pref + 'token')?.value || (await cookies()).get('token')?.value;
  if (token) {
    // Middleware de yönlendiriyor, ama burada da fail-safe olsun
  }

  const t = await getTranslations('Login');

  return (
    <main style={{maxWidth:360,margin:'64px auto',padding:24,border:'1px solid #eee',borderRadius:12}}>
      <h1 style={{marginBottom:16}}>{t('title')}</h1>
      <form action="/api/session/login" method="post">
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <label>{t('email')}
            <input name="email" type="email" required style={{width:'100%'}} />
          </label>
          <label>{t('password')}
            <input name="password" type="password" required style={{width:'100%'}} />
          </label>
          <button type="submit">{t('button')}</button>
        </div>
      </form>
    </main>
  );
}
