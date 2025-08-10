import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  let locale = cookieStore.get('locale')?.value || 'en';
  const supported = ['en','tr'];
  if (!supported.includes(locale)) locale = 'en';
  return { locale, messages: (await import(`../messages/${locale}.json`)).default };
});
