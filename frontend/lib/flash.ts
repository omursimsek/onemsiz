import {NextResponse} from 'next/server';

export type Flash = { type: 'success'|'error'|'info'; message: string };

export function setFlash(res: NextResponse, flash: Flash, maxAgeSec = 8) {
  res.cookies.set('flash', JSON.stringify(flash), {
    path: '/', httpOnly: false, sameSite: 'lax', maxAge: maxAgeSec
  });
}

export function clearFlash(res: NextResponse) {
  res.cookies.set('flash', '', { path:'/', expires: new Date(0) });
}
