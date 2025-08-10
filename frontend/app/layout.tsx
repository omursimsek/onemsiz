import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Header from '../components/Header'; // yeni satır
import React from 'react';

export default async function RootLayout({children}:{children: React.ReactNode}){
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
