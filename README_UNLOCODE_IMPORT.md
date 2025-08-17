# UN-LOCODE Import Sistemi

Bu dokümantasyon, UN-LOCODE verilerini sisteme yüklemek için geliştirilen import sistemini açıklar.

## Genel Bakış

UN-LOCODE (United Nations Code for Trade and Transport Locations), uluslararası ticaret ve ulaşım lokasyonları için standart kodlama sistemidir. Sistem, aşağıdaki dosya türlerini destekler:

## Desteklenen Dosya Türleri

### 1. Code List (code-list.csv)
- **Açıklama**: Ana UN-LOCODE verileri
- **Boyut**: ~7.4 MB
- **İçerik**: Lokasyon kodları, isimler, koordinatlar, fonksiyonlar, durumlar
- **Endpoint**: `/api/platform/location-import/import/unlocode`

### 2. Country Codes (country-codes.csv)
- **Açıklama**: Ülke kodları ve isimleri
- **Boyut**: ~4.18 KB
- **İçerik**: ISO ülke kodları, ülke isimleri
- **Endpoint**: `/api/platform/location-import/import/country-codes`

### 3. Function Classifiers (function-classifiers.csv)
- **Açıklama**: Fonksiyon sınıflandırıcıları
- **Boyut**: ~300 B
- **İçerik**: Port, Demiryolu, Karayolu, Havalimanı türleri
- **Endpoint**: `/api/platform/location-import/import/function-classifiers`

### 4. Status Indicators (status-indicators.csv)
- **Açıklama**: Durum göstergeleri
- **Boyut**: ~827 B
- **İçerik**: Onaylanmış, Beklemede, Geçici gibi durumlar
- **Endpoint**: `/api/platform/location-import/import/status-indicators`

### 5. Subdivision Codes (subdivision-codes.csv)
- **Açıklama**: Alt bölüm kodları
- **Boyut**: ~133 KB
- **İçerik**: TR-35, US-CA gibi alt bölüm kodları
- **Endpoint**: `/api/platform/location-import/import/subdivision-codes`

### 6. Alias (alias.csv)
- **Açıklama**: Takma adlar
- **Boyut**: ~4.77 KB
- **İçerik**: Lokasyon takma adları (örn: İzmir → Smyrna)
- **Endpoint**: `/api/platform/location-import/import/alias`

## Kullanım

### Backend API

Tüm import işlemleri için aşağıdaki endpoint'ler kullanılır:

```http
POST /api/platform/location-import/import/{file-type}
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Örnek Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer {your-token}" \
  -F "file=@code-list.csv" \
  http://localhost:8080/api/platform/location-import/import/unlocode
```

### Frontend Arayüzü

Super admin panelinde `/super/location-import` sayfasından dosyaları yükleyebilirsiniz:

1. **Dosya Seçimi**: Her dosya türü için ayrı dosya seçimi
2. **Yükleme**: Seçilen dosyayı sisteme yükleme
3. **Sonuç Görüntüleme**: Import sonuçlarını görüntüleme
4. **Hata Yönetimi**: Hata durumlarında bilgilendirme

## Teknik Detaylar

### Backend Yapısı

- **Service**: `LocationImportService` - Tüm import işlemlerini yönetir
- **Controller**: `LocationImportController` - HTTP endpoint'leri sağlar
- **Models**: Her dosya türü için özel CSV mapping sınıfları
- **Validation**: Dosya formatı ve içerik doğrulaması

### Frontend Yapısı

- **Sayfa**: `/super/location-import` - Import arayüzü
- **API Wrapper**: `apiPostForm` - Multipart form data desteği
- **State Management**: React hooks ile dosya durumu yönetimi
- **UI Components**: Modern, responsive tasarım

### Veri İşleme

- **CSV Parsing**: CsvHelper kütüphanesi ile CSV okuma
- **Batch Processing**: Büyük dosyalar için batch kaydetme
- **Error Handling**: Hata durumlarında graceful degradation
- **Performance**: Optimized database operations

## Güvenlik

- **Authentication**: PlatformOnly policy ile korumalı
- **Authorization**: Super admin yetkisi gerekli
- **File Validation**: Dosya boyutu ve format kontrolü
- **Input Sanitization**: CSV verilerinin güvenli işlenmesi

## Performans

- **Batch Size**: 1000 kayıt için batch işleme
- **Async Processing**: Non-blocking import işlemleri
- **Memory Management**: Stream-based dosya okuma
- **Database Optimization**: Efficient queries ve indexing

## Hata Yönetimi

- **File Validation**: Boş dosya, format kontrolü
- **Data Validation**: Gerekli alanların kontrolü
- **Database Errors**: Connection ve constraint hataları
- **User Feedback**: Kullanıcı dostu hata mesajları

## Monitoring

- **Import Results**: Başarılı/başarısız kayıt sayıları
- **Performance Metrics**: İşlem süresi ve throughput
- **Error Logging**: Detaylı hata kayıtları
- **Audit Trail**: Import işlem geçmişi

## Gelecek Geliştirmeler

- **Progress Tracking**: Real-time import progress
- **Scheduled Imports**: Otomatik import zamanlaması
- **Data Validation Rules**: Özelleştirilebilir validation
- **Import Templates**: Önceden tanımlanmış import şablonları
- **Data Export**: Import edilen verilerin export edilmesi

## Sorun Giderme

### Yaygın Hatalar

1. **"File is empty"**: Dosya seçilmemiş veya boş
2. **"Upload failed"**: Network veya server hatası
3. **"Invalid format"**: CSV formatı uyumsuz
4. **"Authentication required"**: Token eksik veya geçersiz

### Çözümler

1. Dosya boyutunu ve formatını kontrol edin
2. Network bağlantısını ve server durumunu kontrol edin
3. CSV dosyasının header satırını kontrol edin
4. Login yapın ve token'ı yenileyin

## Destek

Teknik destek için:
- Backend logs: `backend/logs/`
- Frontend console: Browser Developer Tools
- API documentation: Swagger/OpenAPI (varsa)
- Issue tracking: Project repository

## Lisans

Bu özellik proje lisansı altında geliştirilmiştir.
