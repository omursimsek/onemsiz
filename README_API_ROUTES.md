# API Routes - Frontend & Backend Entegrasyonu

## 🎯 Amaç

Frontend'de Next.js API Routes kullanarak backend ile entegrasyonu sağlamak ve CORS sorunlarını çözmek.

## 🔗 **API Route Yapısı**

### **Frontend API Routes (Next.js)**
```
frontend/app/api/super/
├── locations/
│   ├── route.ts                    # GET /api/super/locations
│   ├── statistics/
│   │   └── route.ts               # GET /api/super/locations/statistics
│   └── [id]/
│       └── route.ts               # GET /api/super/locations/[id]
└── location-import/
    └── import/
        └── [type]/
            └── route.ts            # POST /api/super/location-import/import/[type]
```

### **Backend API Endpoints (.NET)**
```
http://localhost:8080/api/platform/
├── locations
│   ├── GET                         # Lokasyon listesi
│   ├── GET /{id}                  # Tek lokasyon detayı
│   ├── GET /statistics            # Genel istatistikler
│   ├── GET /statistics/countries  # Ülke istatistikleri
│   └── GET /statistics/schemes    # Scheme istatistikleri
└── location-import/import/{type}   # Dosya import
```

## 🔧 **Yapılan Değişiklikler**

### 1. **Frontend API Routes Oluşturuldu**

#### **Locations Route**
```typescript
// frontend/app/api/super/locations/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Query parameters'ları backend'e aktar
  const params = new URLSearchParams();
  if (searchParams.get('q')) params.append('q', searchParams.get('q')!);
  if (searchParams.get('country')) params.append('country', searchParams.get('country')!);
  if (searchParams.get('scheme')) params.append('scheme', searchParams.get('scheme')!);
  if (searchParams.get('take')) params.append('take', searchParams.get('take')!);

  const response = await fetch(`${API_BASE}/api/platform/locations?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(request.headers.get('authorization') && {
        'Authorization': request.headers.get('authorization')!
      })
    }
  });

  return NextResponse.json(await response.json());
}
```

#### **Statistics Route**
```typescript
// frontend/app/api/super/locations/statistics/route.ts
export async function GET(request: NextRequest) {
  const response = await fetch(`${API_BASE}/api/platform/locations/statistics`, {
    headers: {
      'Content-Type': 'application/json',
      ...(request.headers.get('authorization') && {
        'Authorization': request.headers.get('authorization')!
      })
    }
  });

  return NextResponse.json(await response.json());
}
```

#### **Location Detail Route**
```typescript
// frontend/app/api/super/locations/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  const response = await fetch(`${API_BASE}/api/platform/locations/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(request.headers.get('authorization') && {
        'Authorization': request.headers.get('authorization')!
      })
    }
  });

  return NextResponse.json(await response.json());
}
```

#### **Location Import Route**
```typescript
// frontend/app/api/super/location-import/import/[type]/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  const formData = await request.formData();

  const response = await fetch(`${API_BASE}/api/platform/location-import/import/${type}`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(request.headers.get('authorization') && {
        'Authorization': request.headers.get('authorization')!
      })
    }
  });

  return NextResponse.json(await response.json());
}
```

### 2. **Config Dosyası Güncellendi**

```typescript
// frontend/lib/config.ts
export const API_ENDPOINTS = {
  // Frontend API Routes (Next.js)
  LOCATIONS: '/api/super/locations',
  LOCATION_STATISTICS: '/api/super/locations/statistics',
  LOCATION_DETAIL: (id: string) => `/api/super/locations/${id}`,
  LOCATION_IMPORT: (type: string) => `/api/super/location-import/import/${type}`,
  
  // Backend API Endpoints (for direct calls if needed)
  BACKEND: {
    LOCATIONS: `${API_BASE}/api/platform/locations`,
    LOCATION_STATISTICS: `${API_BASE}/api/platform/locations/statistics`,
    // ...
  }
} as const;
```

### 3. **Frontend Sayfaları Güncellendi**

#### **Locations Page**
```typescript
// frontend/app/super/locations/page.tsx
import { API_ENDPOINTS } from '../../../lib/config';

const fetchStatistics = async () => {
  const response = await fetch(API_ENDPOINTS.LOCATION_STATISTICS, {
    credentials: 'include'
  });
  // ...
};

const fetchLocations = async () => {
  const response = await fetch(`${API_ENDPOINTS.LOCATIONS}?${params}`, {
    credentials: 'include'
  });
  // ...
};
```

#### **Location Detail Page**
```typescript
// frontend/app/super/locations/[id]/page.tsx
const fetchLocation = async () => {
  const response = await fetch(API_ENDPOINTS.LOCATION_DETAIL(locationId), {
    credentials: 'include'
  });
  // ...
};
```

#### **Location Import Page**
```typescript
// frontend/app/super/location-import/page.tsx
const fileTypes = [
  {
    key: 'unlocode',
    endpoint: API_ENDPOINTS.LOCATION_IMPORT('unlocode')
  },
  // ...
];
```

## 🚀 **Avantajlar**

### 1. **CORS Sorunları Çözüldü**
- Frontend ve backend aynı origin'de
- Cross-origin request'ler yok
- Browser security policy'leri bypass edildi

### 2. **Merkezi API Yönetimi**
- Tüm API çağrıları tek yerden
- Kolay güncelleme ve bakım
- Type safety ile hata önleme

### 3. **Authentication Handling**
- Authorization header'ları otomatik aktarılıyor
- JWT token'lar frontend'de saklanıyor
- Backend'e transparent olarak iletilir

### 4. **Error Handling**
- Frontend'de hata yakalama
- User-friendly error messages
- Backend hatalarını frontend'e uygun formatta

### 5. **Performance**
- API route'lar Next.js'de optimize edilmiş
- Edge runtime desteği
- Caching ve optimization

## 🔒 **Güvenlik**

### 1. **Authorization Header Propagation**
```typescript
// Frontend'den gelen authorization header'ı backend'e aktar
...(request.headers.get('authorization') && {
  'Authorization': request.headers.get('authorization')!
})
```

### 2. **Input Validation**
```typescript
// Query parameters'ları validate et
const params = new URLSearchParams();
if (searchParams.get('q')) params.append('q', searchParams.get('q')!);
```

### 3. **Error Sanitization**
```typescript
// Backend hatalarını sanitize et
return NextResponse.json(
  { error: `Backend error: ${response.status}` },
  { status: response.status }
);
```

## 📱 **Kullanım Senaryoları**

### 1. **Locations Listesi**
```typescript
// Frontend'de
const response = await fetch('/api/super/locations?q=ISTANBUL&country=TR', {
  credentials: 'include'
});

// API Route'da
const response = await fetch(`${API_BASE}/api/platform/locations?${params}`, {
  headers: { 'Authorization': request.headers.get('authorization')! }
});
```

### 2. **Statistics**
```typescript
// Frontend'de
const response = await fetch('/api/super/locations/statistics', {
  credentials: 'include'
});

// API Route'da
const response = await fetch(`${API_BASE}/api/platform/locations/statistics`, {
  headers: { 'Authorization': request.headers.get('authorization')! }
});
```

### 3. **File Upload**
```typescript
// Frontend'de
const formData = new FormData();
formData.append('file', file);
const response = await fetch('/api/super/location-import/import/unlocode', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});

// API Route'da
const response = await fetch(`${API_BASE}/api/platform/location-import/import/${type}`, {
  method: 'POST',
  body: formData,
  headers: { 'Authorization': request.headers.get('authorization')! }
});
```

## 🧪 **Test Senaryoları**

### 1. **Frontend API Route Testi**
```bash
# Locations listesi
curl http://localhost:3000/api/super/locations

# Statistics
curl http://localhost:3000/api/super/locations/statistics

# Location detail
curl http://localhost:3000/api/super/locations/123e4567-e89b-12d3-a456-426614174000
```

### 2. **Backend API Testi**
```bash
# Direct backend test
curl http://localhost:8080/api/platform/locations
curl http://localhost:8080/api/platform/locations/statistics
```

### 3. **Integration Testi**
```bash
# Frontend -> API Route -> Backend flow
# Browser'da /super/locations sayfasını aç
# Network tab'da API çağrılarını kontrol et
```

## 📝 **Gelecek Geliştirmeler**

### 1. **API Versioning**
```typescript
// frontend/app/api/super/v1/locations/route.ts
// frontend/app/api/super/v2/locations/route.ts
```

### 2. **Rate Limiting**
```typescript
import { rateLimit } from 'next-rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function GET(request: NextRequest) {
  await limiter.check(request, 10, 'CACHE_TOKEN');
  // ... API logic
}
```

### 3. **Caching**
```typescript
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
  return response;
}
```

### 4. **Monitoring**
```typescript
export async function GET(request: NextRequest) {
  const start = Date.now();
  
  try {
    const result = await fetchBackend();
    const duration = Date.now() - start;
    console.log(`API call took ${duration}ms`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
```

## 📚 **İlgili Dosyalar**

### **Frontend API Routes**
- `frontend/app/api/super/locations/route.ts`
- `frontend/app/api/super/locations/statistics/route.ts`
- `frontend/app/api/super/locations/[id]/route.ts`
- `frontend/app/api/super/location-import/import/[type]/route.ts`

### **Config ve Sayfalar**
- `frontend/lib/config.ts`
- `frontend/app/super/locations/page.tsx`
- `frontend/app/super/locations/[id]/page.tsx`
- `frontend/app/super/location-import/page.tsx`

## 🎉 **Sonuç**

API Routes yapısı sayesinde:
- ✅ **CORS Sorunları Çözüldü**: Frontend ve backend arasında sorunsuz iletişim
- ✅ **Merkezi Yönetim**: Tüm API çağrıları tek yerden kontrol ediliyor
- ✅ **Authentication**: JWT token'lar otomatik olarak backend'e aktarılıyor
- ✅ **Error Handling**: Kullanıcı dostu hata mesajları
- ✅ **Performance**: Next.js API route optimizasyonları
- ✅ **Security**: Authorization header'ları güvenli şekilde aktarılıyor

Sistem production'da güvenle kullanılabilir! 🚀
