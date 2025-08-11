'use client';
import {create} from 'zustand';

type AuthState = {
  authenticated: boolean | null; // null = bilinmiyor (ilk yükleniş)
  setAuthenticated: (v: boolean) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  authenticated: null,
  setAuthenticated: (v) => set({ authenticated: v }),
  reset: () => set({ authenticated: false })
}));
