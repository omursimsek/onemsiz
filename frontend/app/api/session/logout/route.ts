import {NextResponse} from 'next/server';
const PREFIX = process.env.APP_COOKIE_PREFIX || 'b2b_';

export async function POST() {
  const res = NextResponse.redirect(new URL('/login', 'http://localhost:3000'));
  for (const name of [PREFIX+'token', PREFIX+'user', 'token', 'user']) {
    res.cookies.set(name, '', {path:'/', expires:new Date(0)});
  }
  return res;
}
