'use client';

import {useLocale} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';

type Option = { code: 'en'|'tr'; label: string; flag: string };

const OPTIONS: Option[] = [
  {code: 'en', label: 'English', flag: '🇬🇧'},
  {code: 'tr', label: 'Türkçe',  flag: '🇹🇷'}
];

export default function LanguageSwitcher(){
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function setLocaleCookie(loc: string){
    document.cookie = `locale=${loc}; path=/; max-age=31536000`;
    router.refresh();
  }

  useEffect(()=>{
    function onClick(e: MouseEvent){
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent){
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const current = OPTIONS.find(o => o.code === locale) ?? OPTIONS[0];

  return (
    <div ref={ref} className="relative z-20">
      <button
        type="button"
        onClick={()=>setOpen(v=>!v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
      >
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="font-medium">{current.label}</span>
        <svg className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 7l5 6 5-6H5z" fill="currentColor"></path>
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {OPTIONS.map(opt => {
            const active = opt.code === locale;
            return (
              <li key={opt.code}>
                <button
                  role="option"
                  aria-selected={active}
                  onClick={()=>{ setOpen(false); setLocaleCookie(opt.code); }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm
                              ${active ? 'bg-gray-100 dark:bg-gray-800 font-medium' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                              text-gray-900 dark:text-gray-100`}
                >
                  <span className="text-lg leading-none">{opt.flag}</span>
                  <span>{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
