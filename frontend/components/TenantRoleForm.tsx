'use client';

import {useState} from 'react';

type TenantRow = { id:string; name:string; slug:string; isActive:boolean; createdAt:string };

// Uyumlu roller (enum string’leri)
const ROLE_OPTIONS = [
  { value: 'TenantUser',  label: 'TenantUser'  },
  { value: 'TenantAdmin', label: 'TenantAdmin' },
  { value: 'Staff',       label: 'Staff'       },
  { value: 'SuperAdmin',  label: 'SuperAdmin'  }
];

function isTenantRole(role: string){
  return role === 'TenantUser' || role === 'TenantAdmin';
}

export default function TenantRoleForm({tenants}:{tenants:TenantRow[]}) {
  const [role, setRole] = useState<string>('TenantUser');

  const tenantRequired = isTenantRole(role);
  const tenantDisabled = !tenantRequired;

  return (
    <form
      action="/api/super/users/create"
      method="post"
      className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
    >
      {/* Email */}
      <div className="col-span-1">
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="user@company.com"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* Geçici şifre */}
      <div className="col-span-1">
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Geçici şifre
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          placeholder="Geçici şifre"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {/* Rol */}
      <div className="col-span-1">
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
          Rol
        </label>
        <select
          id="role"
          name="role"
          defaultValue="TenantUser"
          onChange={(e)=> setRole(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
        >
          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          TenantUser / TenantAdmin rollerinde tenant seçimi zorunludur.
        </p>
      </div>

      {/* Tenant */}
      <div className="col-span-1">
        <label htmlFor="tenantId" className="mb-1 block text-sm font-medium text-gray-700">
          Tenant
        </label>
        <select
          id="tenantId"
          name="tenantId"
          required={tenantRequired}
          disabled={tenantDisabled}
          defaultValue=""
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          aria-label="Tenant"
        >
          <option value="" disabled>Tenant seçin</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id} disabled={!t.isActive}>
              {t.name} ({t.slug}){t.isActive ? '' : ' — pasif'}
            </option>
          ))}
        </select>
      </div>

      {/* Aksiyon */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4">
        <button
          type="submit"
          className="flex items-center justify-center min-w-[140px] rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Oluştur
        </button>
        <p className="mt-2 text-xs text-gray-500">
          Not: Staff/SuperAdmin rollerinde tenant seçimi gerekmez ve alan devre dışı bırakılır.
        </p>
      </div>
    </form>
  );
}
