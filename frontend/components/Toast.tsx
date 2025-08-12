'use client';

import {useEffect, useMemo, useState} from 'react';

type Variant = 'success' | 'error' | 'info';
type Props = { initial?: { type: Variant; message: string } | null };

export default function Toast({initial}: Props) {
  const [open, setOpen] = useState(Boolean(initial));
  const [data, setData] = useState(initial);

  // Otomatik kapanma
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 3500);
    return () => clearTimeout(t);
  }, [open]);

  // Hover'da durdurmak istersen:
  // const [hold, setHold] = useState(false);
  // useEffect(() => {
  //   if (!open || hold) return;
  //   const t = setTimeout(() => setOpen(false), 3500);
  //   return () => clearTimeout(t);
  // }, [open, hold]);

  const styles = useMemo(() => {
    const base =
      'pointer-events-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white shadow-lg ring-1 ring-inset transition-all';
    switch (data?.type) {
      case 'success':
        return base + ' bg-emerald-600 ring-emerald-500/40';
      case 'error':
        return base + ' bg-rose-600 ring-rose-500/40';
      default:
        return base + ' bg-slate-700 ring-slate-500/40';
    }
  }, [data?.type]);

  if (!open || !data) return null;

  return (
    <div
      // onMouseEnter={() => setHold(true)}
      // onMouseLeave={() => setHold(false)}
      className="fixed inset-x-0 bottom-4 z-[1000] flex justify-end px-4 sm:justify-end"
      role="status"
      aria-live="polite"
    >
      <button
        onClick={() => setOpen(false)}
        className={`${styles} max-w-[92vw] sm:max-w-sm translate-y-0 opacity-100
                    animate-[toast-in_.2s_ease-out]
                    hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-white/30`}
      >
        {/* İsteğe bağlı ikon (basit dot) */}
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/90"></span>
        <span className="text-left">{data.message}</span>
      </button>

      {/* Basit keyframes (globale eklemediysen inline @layer ile): */}
      <style jsx>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
