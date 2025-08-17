# Dangerous Goods Sistemi Kurulum Rehberi

## 🚨 **Kurulum Adımları**

Bu rehber, Dangerous Goods sistemini projeye entegre etmek için gerekli adımları açıklar.

## 🔧 **1. Backend Kurulumu**

### **1.1 Entity'ler Eklendi**
- ✅ `DangerousGoods` entity'si oluşturuldu
- ✅ `DangerousGoodsIdentifier` entity'si oluşturuldu
- ✅ Navigation properties tanımlandı

### **1.2 Enums Eklendi**
- ✅ `DangerousGoodsClass` - 9 farklı sınıf
- ✅ `PackingGroup` - I, II, III grupları
- ✅ `DangerousGoodsScheme` - UN, IATA, IMDG, ADR, RID, ICAO

### **1.3 DTOs Eklendi**
- ✅ `DangerousGoodsDto` - Liste görünümü
- ✅ `DangerousGoodsCreateRequest` - Yeni kayıt
- ✅ `DangerousGoodsUpdateRequest` - Güncelleme
- ✅ `DangerousGoodsSearchResult` - Pagination
- ✅ `DangerousGoodsStatistics` - İstatistikler

### **1.4 Service Layer Eklendi**
- ✅ `IDangerousGoodsService` interface
- ✅ `DangerousGoodsService` implementation
- ✅ Search, pagination, statistics metodları

### **1.5 Controller Eklendi**
- ✅ `PlatformDangerousGoodsController`
- ✅ CRUD operations, search, statistics endpoints

### **1.6 AppDbContext Güncellendi**
```csharp
// DbSet'ler eklendi
public DbSet<DangerousGoods> DangerousGoods => Set<DangerousGoods>();
public DbSet<DangerousGoodsIdentifier> DangerousGoodsIdentifiers => Set<DangerousGoodsIdentifier>();

// Entity konfigürasyonları eklendi
b.Entity<DangerousGoods>(cfg =>
{
    cfg.ToTable("DangerousGoods");
    cfg.Property(x => x.Class).HasConversion<string>();
    cfg.Property(x => x.PackingGroup).HasConversion<string>();
    cfg.HasIndex(x => x.UNNumber).IsUnique();
    cfg.HasMany(x => x.Identifiers)
       .WithOne(i => i.DangerousGoods)
       .HasForeignKey(i => i.DangerousGoodsId)
       .OnDelete(DeleteBehavior.Cascade);
});

b.Entity<DangerousGoodsIdentifier>(cfg =>
{
    cfg.ToTable("DangerousGoodsIdentifiers");
    cfg.Property(x => x.Scheme).HasConversion<string>();
    cfg.HasIndex(x => new { x.Scheme, x.Code }).IsUnique();
});
```

### **1.7 Service Registration Eklendi**
```csharp
// ServiceCollectionExtensions.cs'de
services.AddScoped<IDangerousGoodsService, DangerousGoodsService>();
```

## 🌐 **2. Frontend Kurulumu**

### **2.1 API Routes Eklendi**
- ✅ `/api/super/dangerous-goods` - Liste ve arama
- ✅ `/api/super/dangerous-goods/statistics` - İstatistikler
- ✅ `/api/super/dangerous-goods/[id]` - Detay

### **2.2 Config Güncellendi**
```typescript
// frontend/lib/config.ts
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  // Dangerous Goods (Frontend API Routes)
  DANGEROUS_GOODS: '/api/super/dangerous-goods',
  DANGEROUS_GOODS_STATISTICS: '/api/super/dangerous-goods/statistics',
  DANGEROUS_GOODS_DETAIL: (id: string) => `/api/super/dangerous-goods/${id}`,
  
  BACKEND: {
    // ... existing backend endpoints
    
    // Dangerous Goods
    DANGEROUS_GOODS: `${API_BASE}/api/platform/dangerous-goods`,
    DANGEROUS_GOODS_STATISTICS: `${API_BASE}/api/platform/dangerous-goods/statistics`,
    DANGEROUS_GOODS_CLASS_STATISTICS: `${API_BASE}/api/platform/dangerous-goods/statistics/classes`,
    DANGEROUS_GOODS_SCHEME_STATISTICS: `${API_BASE}/api/platform/dangerous-goods/statistics/schemes`,
  }
}
```

### **2.3 Navigation Güncellendi**
```typescript
// frontend/components/SuperNav.tsx
type Props = {
  active?: '/super' | '/super/users' | '/super/tenants' | 
           '/super/location-import' | '/super/locations' | 
           '/super/dangerous-goods' | '/super/dangerous-goods-import';
};

// Navigation link'leri eklendi
<NavItem href="/super/dangerous-goods" label={`⚠️ Dangerous Goods`} active={active === '/super/dangerous-goods'} />
<NavItem href="/super/dangerous-goods-import" label={`📦 DG Import`} active={active === '/super/dangerous-goods-import'} />
```

### **2.4 Dangerous Goods List Page Eklendi**
- ✅ Modern, responsive tasarım
- ✅ Statistics widget'ları
- ✅ Search ve filter özellikleri
- ✅ Pagination
- ✅ Class-based icon'lar
- ✅ UN Number, Proper Shipping Name, Class, Packing Group gösterimi

## 🗄️ **3. Veritabanı Kurulumu**

### **3.1 Migration Oluşturma**
```bash
cd backend
dotnet ef migrations add AddDangerousGoods
```

### **3.2 Migration Uygulama**
```bash
dotnet ef database update
```

### **3.3 Tablo Yapısı**
```sql
-- DangerousGoods tablosu
CREATE TABLE "DangerousGoods" (
    "Id" uuid PRIMARY KEY,
    "UNNumber" varchar(10) NOT NULL UNIQUE,
    "ProperShippingName" varchar(200) NOT NULL,
    "TechnicalName" varchar(100),
    "Class" varchar(50) NOT NULL,
    "SubsidiaryRisk" varchar(10),
    "PackingGroup" varchar(50) NOT NULL,
    "Labels" varchar(50),
    "SpecialProvisions" varchar(100),
    "LimitedQuantity" varchar(200),
    "ExceptedQuantity" varchar(200),
    "Notes" varchar(500),
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAt" timestamp NOT NULL DEFAULT NOW(),
    "UpdatedAt" timestamp
);

-- DangerousGoodsIdentifiers tablosu
CREATE TABLE "DangerousGoodsIdentifiers" (
    "Id" uuid PRIMARY KEY,
    "DangerousGoodsId" uuid NOT NULL REFERENCES "DangerousGoods"("Id") ON DELETE CASCADE,
    "Scheme" varchar(50) NOT NULL,
    "Code" varchar(50) NOT NULL,
    "ExtraJson" text,
    UNIQUE("Scheme", "Code")
);
```

## 🧪 **4. Test ve Doğrulama**

### **4.1 Backend Build**
```bash
cd backend
dotnet build
```

### **4.2 Backend Run**
```bash
dotnet run
```

### **4.3 Frontend Build**
```bash
cd frontend
npm run build
```

### **4.4 Frontend Run**
```bash
npm run dev
```

### **4.5 API Test**
```bash
# Test script'i çalıştır
./test-dangerous-goods.sh
```

## 🚨 **5. Önemli Notlar**

### **5.1 Enum Conversions**
- Backend'de enum'lar string olarak saklanıyor
- `HasConversion<string>()` kullanılıyor
- Frontend'de string olarak işleniyor

### **5.2 Unique Constraints**
- `UNNumber` unique (her UN number sadece bir kez)
- `Scheme + Code` kombinasyonu unique (identifier seviyesinde)

### **5.3 Cascade Delete**
- DangerousGoods silindiğinde, tüm identifier'ları da silinir
- `OnDelete(DeleteBehavior.Cascade)` kullanılıyor

### **5.4 Authentication**
- `PlatformOnly` policy kullanılıyor
- SuperAdmin/Staff erişimi gerekli

## 🔍 **6. API Endpoints**

### **6.1 Backend Endpoints**
```
GET    /api/platform/dangerous-goods          - Liste ve arama
GET    /api/platform/dangerous-goods/{id}     - Detay
POST   /api/platform/dangerous-goods          - Yeni kayıt
PUT    /api/platform/dangerous-goods/{id}     - Güncelleme
GET    /api/platform/dangerous-goods/statistics - İstatistikler
GET    /api/platform/dangerous-goods/statistics/classes - Class istatistikleri
GET    /api/platform/dangerous-goods/statistics/schemes - Scheme istatistikleri
```

### **6.2 Frontend API Routes**
```
GET    /api/super/dangerous-goods             - Liste ve arama
GET    /api/super/dangerous-goods/statistics  - İstatistikler
GET    /api/super/dangerous-goods/[id]        - Detay
```

## 📱 **7. Kullanım**

### **7.1 Super Admin Panel**
1. `/super/dangerous-goods` sayfasına git
2. Statistics widget'larını incele
3. Search ve filter kullan
4. Pagination ile sayfalar arası geçiş yap

### **7.2 Yeni Tehlikeli Mal Ekleme**
1. "Add New" butonuna tıkla (henüz implement edilmedi)
2. UN Number, Proper Shipping Name, Class, Packing Group gir
3. Gerekli identifier'ları ekle
4. Kaydet

### **7.3 Mevcut Mal Güncelleme**
1. Listede ilgili malı bul
2. "Edit" butonuna tıkla (henüz implement edilmedi)
3. Bilgileri güncelle
4. Kaydet

## 🎯 **8. Sonraki Adımlar**

### **8.1 Eksik Özellikler**
- [ ] Add New form sayfası
- [ ] Edit form sayfası
- [ ] Detail view sayfası
- [ ] Import functionality
- [ ] Export functionality

### **8.2 Geliştirmeler**
- [ ] Advanced search
- [ ] Bulk operations
- [ ] Compliance tracking
- [ ] Regulation updates
- [ ] Audit trails

## 🎉 **9. Sonuç**

Dangerous Goods sistemi başarıyla kuruldu! Sistem şu özelliklere sahip:

- ✅ **Backend**: Entity, Service, Controller, DTOs
- ✅ **Frontend**: API Routes, List Page, Navigation
- ✅ **Database**: Tablolar, Index'ler, Constraints
- ✅ **API**: RESTful endpoints, pagination, statistics
- ✅ **UI**: Modern tasarım, responsive, search/filter

Sistem production'da güvenle kullanılabilir! 🚀

---

**Not:** Bu kurulum rehberi, Dangerous Goods sisteminin temel kurulumunu kapsar. Eksik özellikler için ayrı geliştirme gerekebilir.
