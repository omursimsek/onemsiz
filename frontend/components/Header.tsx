import LanguageSwitcher from './LanguageSwitcher';
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';

export default async function Header() {
  const t = await getTranslations('Common');
  const cookieStore = await cookies();

  // Yeni isimli cookie (önerdiğimiz prefix ile)
  const pref = process.env.APP_COOKIE_PREFIX || 'b2b_';
  const hasToken = !!(cookieStore.get(pref + 'token')?.value || cookieStore.get('token')?.value);

  return (
    <header style={styles.header}>
      <div style={{fontWeight:600}}>B2B App</div>
      <div style={styles.right}>
        <LanguageSwitcher />
        {hasToken && (
          <form action="/api/session/logout" method="post" style={{marginLeft:12}}>
            <button type="submit" style={styles.btn}>{t('logout')}</button>
          </form>
        )}
      </div>
    </header>
  );
}

const styles: {[k:string]: React.CSSProperties} = {
  header: {
    position:'sticky', top:0, zIndex:50,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'10px 16px', borderBottom:'1px solid #eee', background:'#fff'
  },
    right: { display:'flex', alignItems:'center', gap: 12 },
  btn: {
    border:'1px solid #e5e7eb', background:'#fff', padding:'8px 12px',
    borderRadius:10, cursor:'pointer'
  }
};
