# API Konfigürasyonu - Frontend & Backend Entegrasyonu

## 🎯 Amaç

Frontend ve backend'in ayrı sunucularda çalışması durumunda API entegrasyonunu sağlamak.

## 🔗 **Mevcut Durum**

### **Frontend**
- **URL**: `http://localhost:3000` (Next.js)
- **Port**: 3000

### **Backend**
- **URL**: `http://localhost:8080` (.NET)
- **Port**: 8080

## 🔧 **Yapılan Değişiklikler**

### 1. **Config Dosyası Oluşturuldu**
- **Dosya**: `frontend/lib/config.ts`
- **Amaç**: Merkezi API konfigürasyonu

```typescript
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Locations
  LOCATIONS: `${API_BASE}/api/platform/locations`,
  LOCATION_STATISTICS: `${API_BASE}/api/platform/locations/statistics`,
  LOCATION_COUNTRY_STATISTICS: `${API_BASE}/api/platform/locations/statistics/countries`,
  LOCATION_SCHEME_STATISTICS: `${API_BASE}/api/platform/locations/statistics/schemes`,
  
  // Location Import
  LOCATION_IMPORT: `${API_BASE}/api/platform/location-import/import`,
  
  // Auth
  PING: `${API_BASE}/api/ping`,
} as const;
```

### 2. **Locations Sayfası Güncellendi**
- **Dosya**: `frontend/app/super/locations/page.tsx`
- **Değişiklik**: API endpoint'leri config'den alınıyor

```typescript
import { API_ENDPOINTS } from '../../../lib/config';

// Statistics yükle
const fetchStatistics = async () => {
  const response = await fetch(API_ENDPOINTS.LOCATION_STATISTICS, {
    credentials: 'include'
  });
  // ...
};

// Lokasyonları yükle
const fetchLocations = async () => {
  const response = await fetch(`${API_ENDPOINTS.LOCATIONS}?${params}`, {
    credentials: 'include'
  });
  // ...
};
```

### 3. **Location Detail Sayfası Güncellendi**
- **Dosya**: `frontend/app/super/locations/[id]/page.tsx`
- **Değişiklik**: API endpoint'leri config'den alınıyor

```typescript
import { API_ENDPOINTS } from '../../../lib/config';

const fetchLocation = async () => {
  const response = await fetch(`${API_ENDPOINTS.LOCATIONS}/${locationId}`, {
    credentials: 'include'
  });
  // ...
};
```

## 🌍 **Environment Variables**

### **Geliştirme Ortamı**
```bash
# .env.local (oluşturulacak)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### **Production Ortamı**
```bash
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### **Staging Ortamı**
```bash
# .env.staging
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
```

## 🔄 **API Endpoint'leri**

### **Locations**
- `GET /api/platform/locations` - Lokasyon listesi
- `GET /api/platform/locations/{id}` - Tek lokasyon detayı
- `GET /api/platform/locations/statistics` - Genel istatistikler
- `GET /api/platform/locations/statistics/countries` - Ülke istatistikleri
- `GET /api/platform/locations/statistics/schemes` - Scheme istatistikleri

### **Location Import**
- `POST /api/platform/location-import/import/{type}` - Dosya import

### **Auth**
- `GET /api/ping` - API health check

## 🚀 **Kullanım**

### **1. Environment Variable Ayarla**
```bash
# Frontend dizininde
cd frontend

# .env.local dosyası oluştur
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
```

### **2. Backend'i Çalıştır**
```bash
# Backend dizininde
cd backend
dotnet run
```

### **3. Frontend'i Çalıştır**
```bash
# Frontend dizininde
cd frontend
npm run dev
```

### **4. Test Et**
```bash
# Browser'da aç
http://localhost:3000/super/locations

# API test
curl http://localhost:8080/api/platform/locations/statistics
```

## 🔍 **Hata Ayıklama**

### **404 Hatası**
- Backend çalışıyor mu kontrol et
- Port 8080'de servis var mı kontrol et
- API endpoint'leri doğru mu kontrol et

### **CORS Hatası**
- Backend'de CORS policy kontrol et
- Frontend origin backend'de allow edilmiş mi kontrol et

### **Network Hatası**
- Backend sunucu erişilebilir mi kontrol et
- Firewall/port blocking var mı kontrol et

## 📱 **Responsive API Calls**

### **Mobile**
```typescript
// Mobile'da farklı endpoint kullan
const isMobile = window.innerWidth < 768;
const endpoint = isMobile ? API_ENDPOINTS.LOCATIONS_MOBILE : API_ENDPOINTS.LOCATIONS;
```

### **Tablet**
```typescript
// Tablet'de optimize edilmiş endpoint
const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
const endpoint = isTablet ? API_ENDPOINTS.LOCATIONS_TABLET : API_ENDPOINTS.LOCATIONS;
```

## 🔒 **Güvenlik**

### **1. CORS Policy**
```csharp
// Backend'de CORS ayarları
app.UseCors(builder => builder
    .WithOrigins("http://localhost:3000")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());
```

### **2. Authentication**
```typescript
// Frontend'de JWT token
const response = await fetch(endpoint, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### **3. Rate Limiting**
```typescript
// Frontend'de rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRateLimit = async (endpoint: string) => {
  await delay(100); // 100ms delay
  return fetch(endpoint);
};
```

## 📊 **Performance Optimizasyonları**

### **1. API Caching**
```typescript
// Frontend'de cache
const cache = new Map();

const fetchWithCache = async (endpoint: string) => {
  if (cache.has(endpoint)) {
    return cache.get(endpoint);
  }
  
  const response = await fetch(endpoint);
  const data = await response.json();
  cache.set(endpoint, data);
  return data;
};
```

### **2. Batch Requests**
```typescript
// Birden fazla endpoint'i tek seferde çağır
const fetchMultiple = async (endpoints: string[]) => {
  const promises = endpoints.map(endpoint => fetch(endpoint));
  const responses = await Promise.all(promises);
  return Promise.all(responses.map(r => r.json()));
};
```

### **3. Lazy Loading**
```typescript
// Sadece gerekli verileri yükle
const fetchOnDemand = async (endpoint: string, condition: boolean) => {
  if (!condition) return null;
  return fetch(endpoint);
};
```

## 🧪 **Test Senaryoları**

### **1. Backend Bağlantı Testi**
```bash
curl -v http://localhost:8080/api/ping
```

### **2. Frontend API Testi**
```bash
# Browser console'da
fetch('http://localhost:8080/api/platform/locations/statistics')
  .then(r => r.json())
  .then(console.log);
```

### **3. CORS Testi**
```bash
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS \
  http://localhost:8080/api/platform/locations
```

## 📝 **Gelecek Geliştirmeler**

### **1. API Versioning**
```typescript
export const API_ENDPOINTS = {
  V1: {
    LOCATIONS: `${API_BASE}/api/v1/platform/locations`,
    // ...
  },
  V2: {
    LOCATIONS: `${API_BASE}/api/v2/platform/locations`,
    // ...
  }
};
```

### **2. API Monitoring**
```typescript
const fetchWithMonitoring = async (endpoint: string) => {
  const start = performance.now();
  try {
    const response = await fetch(endpoint);
    const duration = performance.now() - start;
    console.log(`API call to ${endpoint} took ${duration}ms`);
    return response;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};
```

### **3. Retry Logic**
```typescript
const fetchWithRetry = async (endpoint: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(endpoint);
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
};
```

## 📚 **İlgili Dosyalar**

- **Config**: `frontend/lib/config.ts`
- **Locations Page**: `frontend/app/super/locations/page.tsx`
- **Location Detail**: `frontend/app/super/locations/[id]/page.tsx`
- **API Wrapper**: `frontend/lib/api.ts`

## 🎉 **Sonuç**

API konfigürasyonu sayesinde:
- ✅ **Merkezi Yönetim**: Tüm API endpoint'leri tek yerden
- ✅ **Environment Support**: Farklı ortamlar için farklı URL'ler
- ✅ **Maintainability**: Kolay güncelleme ve bakım
- ✅ **Scalability**: Yeni endpoint'ler kolayca eklenebilir
- ✅ **Type Safety**: TypeScript ile tip güvenliği

Sistem production'da güvenle kullanılabilir! 🚀
