'use client';
import {useEffect, useState} from 'react';

type Props = { initial?: {type:'success'|'error'|'info'; message:string}|null };

export default function Toast({initial}:Props){
  const [open, setOpen] = useState(Boolean(initial));
  const [data, setData] = useState(initial);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 3500);
    return () => clearTimeout(t);
  }, [open]);

  if (!open || !data) return null;

  const bg = data.type === 'success' ? '#16a34a'
          : data.type === 'error'   ? '#dc2626'
          : '#334155';

  return (
    <div style={{
      position:'fixed', right:16, bottom:16, zIndex:1000,
      background:bg, color:'#fff', padding:'10px 12px',
      borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.15)'
    }}
      onClick={()=>setOpen(false)}
      role="status" aria-live="polite"
    >
      {data.message}
    </div>
  );
}
