import Link from 'next/link';
export default function Home(){
  return (<main style={{padding:24}}>
    <h1>B2B Frontend (DEV)</h1>
    <ul><li><Link href="/login">Login</Link></li></ul>
  </main>);
}
