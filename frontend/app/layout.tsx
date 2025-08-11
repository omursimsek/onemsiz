import './globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getLocale} from 'next-intl/server';
import Header from '../components/Header';
import TenantBootstrap from '../components/TenantBootstrap';

export default async function RootLayout({children}:{children:React.ReactNode}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <TenantBootstrap /> {/* ← global store’u doldurur */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
