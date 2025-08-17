# Locations Sayfası - Kullanım Kılavuzu

## 🎯 Amaç

Yüklenen UN-LOCODE verilerini görüntülemek, aramak ve yönetmek için kapsamlı bir arayüz sağlamak.

## 📍 Erişim

- **URL**: `/super/locations`
- **Navigation**: Super Admin menüsünde "📍 Locations" linki
- **Yetki**: PlatformOnly policy (Super Admin/Staff)

## 🚀 Özellikler

### 1. **Lokasyon Listesi**
- Tüm yüklenen lokasyonları tablo formatında gösterir
- Her lokasyon için detaylı bilgiler
- Responsive tasarım

### 2. **Arama ve Filtreleme**
- **Search**: Lokasyon adı veya açıklama ile arama
- **Country Filter**: Ülke kodu ile filtreleme (TR, US, DE...)
- **Scheme Filter**: Kodlama sistemi ile filtreleme
- **Limit**: Sayfa başına gösterilecek kayıt sayısı

### 3. **Pagination**
- Sayfa başına 25, 50, 100, 200 kayıt
- Previous/Next navigation
- Toplam sonuç sayısı gösterimi

### 4. **Detay Görüntüleme**
- Her lokasyon için "View" butonu
- Detaylı lokasyon bilgileri
- UN-LOCODE extra data gösterimi

## 📊 Tablo Kolonları

| Kolon | Açıklama | İçerik |
|-------|----------|---------|
| **Location** | Lokasyon bilgileri | Name, NameAscii, Subdivision |
| **Country** | Ülke kodu | ISO 2-letter code (TR, US, DE) |
| **Type** | Lokasyon türü | Station, Port, Airport, Border |
| **Identifiers** | Kodlar | UN-LOCODE, UIC, RNE, IATA, Custom |
| **Status** | Aktiflik durumu | Active/Inactive |
| **Created** | Oluşturulma tarihi | Date + Time |
| **Actions** | İşlemler | View (detay sayfasına git) |

## 🔍 Arama ve Filtreleme

### Search
- **Placeholder**: "Lokasyon adı veya açıklama..."
- **Debounce**: 500ms (performans için)
- **Case-insensitive**: Büyük/küçük harf duyarsız

### Country Filter
- **Format**: 2-letter ISO code
- **Örnek**: TR, US, DE, FR, GB
- **Auto-uppercase**: Otomatik büyük harfe çevrilir

### Scheme Filter
- **UNLOCODE**: UN-LOCODE kodları
- **UIC**: UIC station kodları
- **RNE**: RNE lokasyon kodları
- **IATA**: Havalimanı kodları
- **Custom**: Özel kodlar

### Limit
- **25**: Küçük listeler için
- **50**: Varsayılan (önerilen)
- **100**: Orta boyutlu listeler için
- **200**: Büyük listeler için

## 📱 Responsive Tasarım

### Desktop (lg+)
- 5 kolonlu filter grid
- Tam tablo görünümü
- Side-by-side layout

### Tablet (md)
- 2 kolonlu filter grid
- Tablo horizontal scroll
- Optimized spacing

### Mobile (sm)
- 1 kolonlu filter grid
- Stacked layout
- Touch-friendly buttons

## 🎨 UI Bileşenleri

### Filter Panel
- **Background**: White with border
- **Shadow**: Subtle shadow for depth
- **Spacing**: Consistent padding and margins

### Table
- **Header**: Gray background with uppercase text
- **Rows**: Hover effect (gray-50)
- **Borders**: Subtle dividers between rows

### Status Badges
- **Active**: Green background
- **Inactive**: Red background
- **Country**: Blue background
- **Type**: Green background

### Buttons
- **Primary**: Blue theme
- **Secondary**: Gray theme
- **Danger**: Red theme
- **Hover**: Consistent hover states

## 🔗 Navigation

### Internal Links
- **View Button**: `/super/locations/{id}`
- **Back Button**: Previous page
- **Clear Filters**: Reset all filters

### External Integration
- **API Endpoint**: `/api/platform/locations`
- **Authentication**: JWT token required
- **CORS**: Same-origin policy

## 📊 Veri Yapısı

### Location Interface
```typescript
interface Location {
  id: string;
  name: string;
  nameAscii?: string;
  countryISO2: string;
  subdivision?: string;
  kind: string;
  isActive: boolean;
  createdAt: string;
  identifiers: Identifier[];
}
```

### Identifier Interface
```typescript
interface Identifier {
  id: string;
  scheme: string;
  code: string;
}
```

## 🚨 Hata Yönetimi

### Network Errors
- HTTP status code handling
- User-friendly error messages
- Retry mechanism

### Data Errors
- Empty state handling
- Loading states
- Graceful degradation

### Validation Errors
- Input validation
- Real-time feedback
- Error highlighting

## 🔧 Teknik Detaylar

### State Management
- **React Hooks**: useState, useEffect
- **Local State**: Search, filters, pagination
- **API State**: Loading, error, data

### Performance
- **Debounced Search**: 500ms delay
- **Pagination**: Client-side slicing
- **Memoization**: Optimized re-renders

### API Integration
- **Fetch API**: Modern HTTP client
- **Credentials**: Include for authentication
- **Error Handling**: Comprehensive error states

## 📱 Kullanım Senaryoları

### 1. **Lokasyon Arama**
1. Search box'a lokasyon adı yazın
2. Sonuçlar otomatik filtrelenir
3. Debounce ile performans optimize edilir

### 2. **Ülke Bazlı Filtreleme**
1. Country filter'a ülke kodu girin (TR)
2. Sadece o ülkedeki lokasyonlar gösterilir
3. Diğer filter'lar ile kombinlenebilir

### 3. **Scheme Bazlı Filtreleme**
1. Scheme dropdown'dan seçim yapın
2. Sadece o kodlama sistemindeki lokasyonlar gösterilir
3. Örnek: UNLOCODE seçerek sadece UN-LOCODE kodlarını görün

### 4. **Pagination Kullanımı**
1. Limit dropdown'dan sayfa başına kayıt sayısını seçin
2. Previous/Next butonları ile sayfalar arası geçiş yapın
3. Toplam sonuç sayısını takip edin

### 5. **Detay Görüntüleme**
1. Herhangi bir lokasyon için "View" butonuna tıklayın
2. Detay sayfasına yönlendirilirsiniz
3. Tüm lokasyon bilgileri ve identifier'lar görüntülenir

## 🔄 Gelecek Geliştirmeler

### 1. **Advanced Search**
- Full-text search
- Fuzzy matching
- Search suggestions

### 2. **Bulk Operations**
- Multiple selection
- Bulk edit
- Bulk delete
- Export functionality

### 3. **Real-time Updates**
- WebSocket integration
- Live data refresh
- Push notifications

### 4. **Advanced Filtering**
- Date range filters
- Coordinate-based filtering
- Custom filter combinations

### 5. **Data Export**
- CSV export
- Excel export
- PDF reports
- API endpoints

## 📚 İlgili Dosyalar

- **Main Page**: `frontend/app/super/locations/page.tsx`
- **Detail Page**: `frontend/app/super/locations/[id]/page.tsx`
- **Navigation**: `frontend/components/SuperNav.tsx`
- **API**: `backend/Controllers/PlatformLocationsController.cs`
- **Service**: `backend/Application/Services/LocationService.cs`

## 🎉 Sonuç

Locations sayfası sayesinde:
- ✅ **Kolay Erişim**: Tüm lokasyonlar tek yerden
- ✅ **Güçlü Arama**: Hızlı ve etkili filtreleme
- ✅ **Responsive Tasarım**: Tüm cihazlarda uyumlu
- ✅ **Detaylı Görünüm**: Her lokasyon için kapsamlı bilgi
- ✅ **Kullanıcı Dostu**: Intuitive ve modern arayüz

Sistem production'da güvenle kullanılabilir! 🚀
