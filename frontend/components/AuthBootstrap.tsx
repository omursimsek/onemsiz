'use client';
import {useEffect} from 'react';
import {useAuthStore} from '../stores/authStore';

export default function AuthBootstrap(){
  const setAuth = useAuthStore(s => s.setAuthenticated);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/session/status', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!aborted) setAuth(Boolean(data?.authenticated));
      } catch {
        if (!aborted) setAuth(false);
      }
    })();
    return () => { aborted = true; };
  }, [setAuth]);

  return null;
}
