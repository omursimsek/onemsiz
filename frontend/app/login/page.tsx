import {getTranslations} from 'next-intl/server';
import {cookies} from 'next/headers';
import Toast from '/components/Toast';

export default async function LoginPage() {
  const pref = process.env.APP_COOKIE_PREFIX || 'b2b_';
  const token = (await cookies()).get(pref + 'token')?.value || (await cookies()).get('token')?.value;
  // İsteğe bağlı: token varsa burada ek kontrol/yönlendirme yapabilirsin

  const t = await getTranslations('Login');
  const flashRaw = (await cookies()).get('flash')?.value || null;
  const flash = flashRaw ? JSON.parse(flashRaw) : null;

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <Toast initial={flash} />
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">{t('title')}</h1>

        <form action="/api/session/login" method="post" className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="you@company.com"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {t('button')}
          </button>
        </form>
      </div>
    </main>
  );
}
