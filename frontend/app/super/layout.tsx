import SuperNav from '../../components/SuperNav';
import {ReactNode} from 'react';

// If your Header is ~52px tall. Adjust if different.
const HEADER_H = 52;
const SIDEBAR_W = 240;

export default function SuperLayout({children}:{children: ReactNode}){
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        minHeight: `calc(100vh - ${HEADER_H}px)`,
      }}
    >
      <SuperNav headerHeight={HEADER_H} width={SIDEBAR_W} />
      <main
        style={{
          flex: '1 1 auto',
          minWidth: 0,            // ← prevents overlap when content is wide
          padding: 24,
          overflowX: 'auto',      // ← tables won’t push into the sidebar
          background: '#fff'
        }}
      >
        {children}
      </main>
    </div>
  );
}
