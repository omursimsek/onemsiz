import SuperNav from '../../components/SuperNav';
import {ReactNode} from 'react';
import {HEADER_HEIGHT, SIDEBAR_WIDTH} from '../../shared/ui';



export default function SuperLayout({children}:{children: React.ReactNode}) {
  return (
    <div
      style={{
        display:'flex', alignItems:'stretch',
        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`
      }}
    >
      <SuperNav />
      <main style={{flex:'1 1 auto', minWidth:0, padding:24, overflowX:'auto', background:'#fff'}}>
        {children}
      </main>
    </div>
  );
}
