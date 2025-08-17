import { NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

export async function GET(req: Request) {
  const token = (req.headers.get('cookie') || '')
    .split(';').map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];

  if (!token) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  try {
    const { searchParams } = new URL(req.url);
    
    // Query parameters'ları backend'e aktar
    const params = new URLSearchParams();
    if (searchParams.get('q')) params.append('q', searchParams.get('q')!);
    if (searchParams.get('unNumber')) params.append('unNumber', searchParams.get('unNumber')!);
    if (searchParams.get('dgClass')) params.append('dgClass', searchParams.get('dgClass')!);
    if (searchParams.get('scheme')) params.append('scheme', searchParams.get('scheme')!);
    if (searchParams.get('code')) params.append('code', searchParams.get('code')!);
    if (searchParams.get('take')) params.append('take', searchParams.get('take')!);
    if (searchParams.get('page')) params.append('page', searchParams.get('page')!);

    const response = await fetch(`${API_BASE}/api/platform/dangerous-goods?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decodeURIComponent(token)}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Dangerous Goods API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
