import SuperNav from '../../components/SuperNav';
import {ReactNode} from 'react';

export default function SuperLayout({children}:{children: ReactNode}){
  return (
    <div style={{display:'grid', gridTemplateColumns:'240px 1fr'}}>
      <SuperNav />
      <div>{children}</div>
    </div>
  );
}
