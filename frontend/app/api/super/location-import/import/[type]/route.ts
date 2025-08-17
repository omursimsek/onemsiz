import { NextResponse } from 'next/server';

const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';

export async function POST(
  req: Request,
  { params }: { params: { type: string } }
) {
  const token = (req.headers.get('cookie') || '')
    .split(';').map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];

  if (!token) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  try {
    const { type } = params;
    const formData = await req.formData();

    const response = await fetch(`${API_BASE}/api/platform/location-import/import/${type}`, {
      method: 'POST',
      body: formData,
      headers: {
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
    console.error('Location import API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
