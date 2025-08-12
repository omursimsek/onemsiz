import Image from 'next/image';
import Link from 'next/link';
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';
import LanguageSwitcher from './LanguageSwitcher';
import {HEADER_HEIGHT} from '../shared/ui';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, Menu, X,
  Globe, Building2, Factory, LogOut, LogIn, LayoutDashboard, Package,
  CalendarClock, FileText, Receipt, MessageSquare, HelpCircle, Settings, Building
} from 'lucide-react';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

async function getTenantInfo() {
  const c = await cookies();
  const token = c.get(PREF + 'token')?.value || c.get('token')?.value;
  const userRaw = c.get(PREF + 'user')?.value || c.get('user')?.value;

  if (!token || !userRaw) return { logoUrl: null as string | null, name: null as string | null, authenticated: false };

  // Tenant yoksa (Super/Staff) global logo kalsın
  let hasTenant = false;
  try {
    const u = JSON.parse(userRaw);
    hasTenant = Boolean(u?.tenantId);
  } catch { /* ignore */ }

  if (!hasTenant) return { logoUrl: null, name: null, authenticated: true };

  const res = await fetch(`${API_BASE}/api/tenant/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!res.ok) return { logoUrl: null, name: null, authenticated: true };

  const data = await res.json();
  return {
    logoUrl: data.logoUrl ?? null,
    name: data.name ?? null,
    authenticated: true
  };
}

export default async function Header() {
  const t = await getTranslations('Common');
  const info = await getTenantInfo();

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      style={{height: HEADER_HEIGHT}}
    >
      <div className="mx-auto flex h-full max-w-screen-2xl items-center justify-between px-3 sm:px-4">
        {/* Left: logo + app name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3">
            {info.logoUrl ? (
              // Tenant logosu (CDN/API)
              <img src={info.logoUrl} alt="Tenant Logo" className="h-8 w-auto" />
            ) : (
              <Image src="/logo.svg" alt="Logo" width={32} height={32} priority className="h-8 w-8" />
            )}
            <span className="text-[18px] font-semibold text-gray-900">
              {info.name ?? 'B2B SaaS'}
            </span>
          </Link>
        </div>

        {/* Right: language + auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          {info.authenticated ? (
            <form action="/api/session/logout" method="post">
              <button className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                <LogOut className="mr-1 inline h-4 w-4" /> {t('logout')}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            ><LogIn className="mr-1 inline h-4 w-4" /> {t('login') ?? 'Login'}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
