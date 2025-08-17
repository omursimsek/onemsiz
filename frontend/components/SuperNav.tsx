import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {HEADER_HEIGHT, SIDEBAR_WIDTH} from '../shared/ui';

type Props = {
  width?: number;
  /** optional: "/super", "/super/users", "/super/tenants", "/super/location-import", "/super/locations", "/super/dangerous-goods", "/super/dangerous-goods-import" */
  active?: '/super' | '/super/users' | '/super/tenants' | '/super/location-import' | '/super/locations' | '/super/dangerous-goods' | '/super/dangerous-goods-import';
};

export default async function SuperNav({width = SIDEBAR_WIDTH, active}: Props) {
  const t = await getTranslations('super-nav');

  return (
    <aside
      className="
        sticky border-r bg-white
        [&>*]:box-border
      "
      style={{
        top: HEADER_HEIGHT,
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        width,
        flex: `0 0 ${width}px`,
        zIndex: 10,
      }}
    >
      {/*
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="text-[18px] font-semibold text-gray-900">{t('title')}</div>
      </div>
      */}

      <nav className="px-3 py-3 space-y-1 overflow-y-auto">
        <NavItem href="/super"        label={`🏠 ${t('dashboard')}`} active={active === '/super'} />
        <NavItem href="/super/users"  label={`👥 ${t('users')}`}     active={active === '/super/users'} />
        <NavItem href="/super/tenants" label={`🏢 ${t('tenants')}`}  active={active === '/super/tenants'} />
        <NavItem href="/super/location-import" label={`📊 Location Import`} active={active === '/super/location-import'} />
        <NavItem href="/super/locations" label={`📍 Locations`} active={active === '/super/locations'} />
        <NavItem href="/super/dangerous-goods" label={`⚠️ Dangerous Goods`} active={active === '/super/dangerous-goods'} />
        <NavItem href="/super/dangerous-goods-import" label={`📦 DG Import`} active={active === '/super/dangerous-goods-import'} />
      </nav>
    </aside>
  );
}

function NavItem({href, label, active}:{href:string; label:string; active?:boolean}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`
        group relative flex items-center gap-2 rounded-xl px-3 py-2
        text-sm text-gray-700 hover:bg-gray-100
        border border-transparent hover:border-gray-200
        transition-colors
        ${active ? 'bg-gray-100 font-medium border-gray-200' : ''}
      `}
    >
      {/* sol aktif şerit */}
      <span
        className={`
          absolute left-0 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-r
          ${active ? 'bg-gray-900' : 'bg-transparent'}
        `}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}
