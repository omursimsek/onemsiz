'use client';
import { create } from 'zustand';

type TenantInfo = {
  id: string;
  name: string;
  slug: string;
  defaultCulture?: string | null;
  logoUrl?: string | null;
};

type TenantState = {
  info: TenantInfo | null;
  setInfo: (i: TenantInfo | null) => void;
};

export const useTenantStore = create<TenantState>((set) => ({
  info: null,
  setInfo: (i) => set({ info: i })
}));
