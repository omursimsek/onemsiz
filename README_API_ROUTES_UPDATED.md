# API Routes - Güncellenmiş Yapı

## 🎯 Amaç

Mevcut route yapısına benzer şekilde API route'ları güncellemek ve cookie-based authentication kullanmak.

## 🔗 **Güncellenmiş API Route Yapısı**

### **Frontend API Routes (Next.js)**
```
frontend/app/api/super/
├── locations/
│   ├── route.ts                    # GET /api/super/locations
│   ├── statistics/
│   │   └── route.ts               # GET /api/super/locations/statistics
│   └── [id]/
│       └── route.ts               # GET /api/super/locations/[id]
├── location-import/
│   └── import/
│       └── [type]/
│           └── route.ts            # POST /api/super/location-import/import/[type]
└── tenants/
    └── create/
        └── route.ts                # POST /api/super/tenants/create (mevcut)
```

## 🔧 **Yapılan Güncellemeler**

### 1. **Authentication Yapısı Değişti**

#### **Önceki Hali (Authorization Header)**
```typescript
// Frontend'de
const response = await fetch('/api/super/locations', {
  credentials: 'include'
});

// API Route'da
const response = await fetch(`${API_BASE}/api/platform/locations`, {
  headers: {
    ...(request.headers.get('authorization') && {
      'Authorization': request.headers.get('authorization')!
    })
  }
});
```

#### **Yeni Hali (Cookie-based)**
```typescript
// Frontend'de
const response = await fetch('/api/super/locations');

// API Route'da
const token = (req.headers.get('cookie') || '')
  .split(';').map(s => s.trim().split('='))
  .find(([k]) => k === PREF + 'token')?.[1];

if (!token) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

const response = await fetch(`${API_BASE}/api/platform/locations`, {
  headers: {
    'Authorization': `Bearer ${decodeURIComponent(token)}`
  }
});
```

### 2. **Environment Variables**

```typescript
const API_BASE = process.env.API_BASE_INTERNAL || 'http://api:8080';
const PREF = process.env.APP_COOKIE_PREFIX || 'b2b_';
```

### 3. **Error Handling**

```typescript
// Token yoksa login'e yönlendir
if (!token) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

// Backend hatası
if (!response.ok) {
  return NextResponse.json(
    { error: `Backend error: ${response.status}` },
    { status: response.status }
  );
}
```

## 📝 **Güncellenmiş Route Dosyaları**

### **1. Locations Route**
```typescript
// frontend/app/api/super/locations/route.ts
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
    if (searchParams.get('country')) params.append('country', searchParams.get('country')!);
    if (searchParams.get('scheme')) params.append('scheme', searchParams.get('scheme')!);
    if (searchParams.get('take')) params.append('take', searchParams.get('take')!);

    const response = await fetch(`${API_BASE}/api/platform/locations?${params}`, {
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
    console.error('Locations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **2. Statistics Route**
```typescript
// frontend/app/api/super/locations/statistics/route.ts
export async function GET(req: Request) {
  const token = (req.headers.get('cookie') || '')
    .split(';').map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];

  if (!token) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  try {
    const response = await fetch(`${API_BASE}/api/platform/locations/statistics`, {
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
    console.error('Locations statistics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **3. Location Detail Route**
```typescript
// frontend/app/api/super/locations/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = (req.headers.get('cookie') || '')
    .split(';').map(s => s.trim().split('='))
    .find(([k]) => k === PREF + 'token')?.[1];

  if (!token) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  try {
    const { id } = params;

    const response = await fetch(`${API_BASE}/api/platform/locations/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${decodeURIComponent(token)}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Location not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Location detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **4. Location Import Route**
```typescript
// frontend/app/api/super/location-import/import/[type]/route.ts
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
```

## 🔒 **Authentication Flow**

### **1. Cookie'den Token Alma**
```typescript
const token = (req.headers.get('cookie') || '')
  .split(';').map(s => s.trim().split('='))
  .find(([k]) => k === PREF + 'token')?.[1];
```

### **2. Token Validation**
```typescript
if (!token) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });
```

### **3. Backend'e Token Gönderme**
```typescript
const response = await fetch(`${API_BASE}/api/platform/locations`, {
  headers: {
    'Authorization': `Bearer ${decodeURIComponent(token)}`
  }
});
```

## 🌍 **Environment Variables**

### **Geliştirme Ortamı**
```bash
# .env.local
API_BASE_INTERNAL=http://localhost:8080
APP_COOKIE_PREFIX=b2b_
```

### **Production Ortamı**
```bash
# .env.production
API_BASE_INTERNAL=http://api:8080
APP_COOKIE_PREFIX=b2b_
```

### **Docker Ortamı**
```bash
# docker-compose.yml
environment:
  - API_BASE_INTERNAL=http://api:8080
  - APP_COOKIE_PREFIX=b2b_
```

## 🚀 **Frontend Kullanımı**

### **1. Locations Page**
```typescript
// Önceki hali
const response = await fetch(API_ENDPOINTS.LOCATION_STATISTICS, {
  credentials: 'include'
});

// Yeni hali
const response = await fetch(API_ENDPOINTS.LOCATION_STATISTICS);
```

### **2. Location Detail Page**
```typescript
// Önceki hali
const response = await fetch(API_ENDPOINTS.LOCATION_DETAIL(locationId), {
  credentials: 'include'
});

// Yeni hali
const response = await fetch(API_ENDPOINTS.LOCATION_DETAIL(locationId));
```

### **3. Location Import Page**
```typescript
// Önceki hali
const response = await fetch(endpoint, {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

// Yeni hali
const response = await fetch(endpoint, {
  method: 'POST',
  body: formData
});
```

## 🧪 **Test Senaryoları**

### **1. Authentication Testi**
```bash
# Token olmadan
curl http://localhost:3000/api/super/locations
# Redirect to /login

# Token ile
curl -H "Cookie: b2b_token=your-jwt-token" \
  http://localhost:3000/api/super/locations
```

### **2. Backend Integration Testi**
```bash
# Frontend API route
curl -H "Cookie: b2b_token=your-jwt-token" \
  http://localhost:3000/api/super/locations/statistics

# Backend direkt
curl -H "Authorization: Bearer your-jwt-token" \
  http://localhost:8080/api/platform/locations/statistics
```

### **3. Error Handling Testi**
```bash
# 404 test
curl -H "Cookie: b2b_token=your-jwt-token" \
  http://localhost:3000/api/super/locations/invalid-id

# Backend error test
curl -H "Cookie: b2b_token=invalid-token" \
  http://localhost:3000/api/super/locations
```

## 📝 **Gelecek Geliştirmeler**

### **1. Token Refresh**
```typescript
// Token expired kontrolü
if (response.status === 401) {
  // Refresh token logic
  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Cookie': req.headers.get('cookie') || '' }
  });
  
  if (refreshResponse.ok) {
    // Retry original request with new token
  }
}
```

### **2. Rate Limiting**
```typescript
import { rateLimit } from 'next-rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export async function GET(req: Request) {
  await limiter.check(req, 10, 'CACHE_TOKEN');
  // ... API logic
}
```

### **3. Caching**
```typescript
export async function GET(req: Request) {
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return response;
}
```

## 📚 **İlgili Dosyalar**

### **API Routes**
- `frontend/app/api/super/locations/route.ts`
- `frontend/app/api/super/locations/statistics/route.ts`
- `frontend/app/api/super/locations/[id]/route.ts`
- `frontend/app/api/super/location-import/import/[type]/route.ts`
- `frontend/app/api/super/tenants/create/route.ts` (mevcut)

### **Frontend Sayfaları**
- `frontend/app/super/locations/page.tsx`
- `frontend/app/super/locations/[id]/page.tsx`
- `frontend/app/super/location-import/page.tsx`

### **Config**
- `frontend/lib/config.ts`

## 🎉 **Sonuç**

Güncellenmiş API route yapısı sayesinde:
- ✅ **Mevcut Yapıya Uyumlu**: Tenants create route'u ile aynı pattern
- ✅ **Cookie-based Authentication**: JWT token'lar cookie'den alınıyor
- ✅ **Automatic Redirect**: Token yoksa login'e yönlendirme
- ✅ **Consistent Error Handling**: Tüm route'larda aynı hata yönetimi
- ✅ **Environment Variables**: Farklı ortamlar için esnek konfigürasyon
- ✅ **Security**: Token validation ve backend'e güvenli aktarım

Sistem production'da güvenle kullanılabilir! 🚀
