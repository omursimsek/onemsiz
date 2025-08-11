"use client";
import {useLocale} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';

type Option = { code: 'en'|'tr'; label: string; flag: string };

const OPTIONS: Option[] = [
  {code: 'en', label: 'English', flag: '🇬🇧'},
  {code: 'tr', label: 'Türkçe', flag: '🇹🇷'}
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
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const current = OPTIONS.find(o => o.code === locale) ?? OPTIONS[0];

  return (
    <div ref={ref} style={styles.container}>
      <button onClick={()=>setOpen(v=>!v)} style={styles.trigger} aria-haspopup="listbox" aria-expanded={open}>
        <span style={{fontSize: 18, marginRight: 8}}>{current.flag}</span>
        <span style={{color:'black'}}>{current.label}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" style={{marginLeft: 6}}>
          <path d="M5 7l5 6 5-6H5z"></path>
        </svg>
      </button>
      {open && (
        <ul role="listbox" style={styles.menu}>
          {OPTIONS.map(opt => (
            <li key={opt.code}>
              <button
                role="option"
                aria-selected={opt.code === locale}
                onClick={()=>{ setOpen(false); setLocaleCookie(opt.code); }}
                style={{...styles.item, ...(opt.code===locale?styles.itemActive:{} )}}
              >
                <span style={{fontSize: 18, marginRight: 8}}>{opt.flag}</span>
                <span style={{color:'black'}}>{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles: {[k:string]: React.CSSProperties} = {
    container: { position: 'relative', zIndex: 20 },

  trigger: {
    display: 'flex', alignItems: 'center', borderRadius: 12, padding: '8px 12px',
    border: '1px solid #e5e7eb', background: '#ffffff', cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  menu: {
    position: 'absolute', right: 0, marginTop: 8, background: '#fff',
    border: '1px solid #e5e7eb', borderRadius: 12, listStyle: 'none', padding: 6,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  },
  item: {
    display: 'flex', alignItems: 'center', width: '100%', padding: '8px 10px',
    background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 10
  },
  itemActive: { background: '#f3f4f6' }
};
