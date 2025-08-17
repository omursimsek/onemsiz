# Dangerous Goods Sistemi

## 🚨 **Genel Bakış**

Bu sistem, uluslararası standartlara (IATA, IMDG, ADR, RID, ICAO) uygun olarak tehlikeli malların yönetimini sağlar. Tehlikeli mallar, taşıma sırasında özel önlemler gerektiren maddelerdir.

## 📋 **Dangerous Goods Sınıflandırması**

### **Class 1: Explosives (Patlayıcılar)**
- **1.1**: Mass explosion hazard
- **1.2**: Projection hazard
- **1.3**: Fire hazard
- **1.4**: Minor explosion hazard
- **1.5**: Very insensitive explosives
- **1.6**: Extremely insensitive explosives

### **Class 2: Gases (Gazlar)**
- **2.1**: Flammable gases
- **2.2**: Non-flammable, non-toxic gases
- **2.3**: Toxic gases

### **Class 3: Flammable Liquids (Yanıcı Sıvılar)**
- Flash point < 23°C (73°F)
- Flash point ≥ 23°C and ≤ 60°C (140°F)

### **Class 4: Flammable Solids (Yanıcı Katılar)**
- **4.1**: Flammable solids
- **4.2**: Spontaneously combustible
- **4.3**: Dangerous when wet

### **Class 5: Oxidizing Substances (Oksitleyici Maddeler)**
- **5.1**: Oxidizing substances
- **5.2**: Organic peroxides

### **Class 6: Toxic & Infectious Substances (Zehirli ve Bulaşıcı Maddeler)**
- **6.1**: Toxic substances
- **6.2**: Infectious substances

### **Class 7: Radioactive Material (Radyoaktif Materyal)**
- Category I, II, III
- Special form, normal form

### **Class 8: Corrosives (Aşındırıcı Maddeler)**
- Acids, bases, other corrosive substances

### **Class 9: Miscellaneous Dangerous Substances (Diğer Tehlikeli Maddeler)**
- Environmentally hazardous substances
- Elevated temperature substances
- Other substances

## 🏷️ **Packing Groups**

### **Packing Group I (High Danger)**
- Yüksek tehlikeli maddeler
- En sıkı paketleme gereksinimleri
- Örnek: Çok zehirli maddeler

### **Packing Group II (Medium Danger)**
- Orta tehlikeli maddeler
- Orta seviye paketleme gereksinimleri
- Örnek: Yanıcı sıvılar

### **Packing Group III (Low Danger)**
- Düşük tehlikeli maddeler
- En az sıkı paketleme gereksinimleri
- Örnek: Hafif yanıcı maddeler

## 🔍 **Sistem Özellikleri**

### **1. Backend (C# .NET)**
- **Entity Framework Core** ile veritabanı yönetimi
- **Repository Pattern** ile veri erişimi
- **Service Layer** ile iş mantığı
- **DTO Pattern** ile veri transferi
- **Pagination** ile büyük veri setleri
- **Statistics** ile analitik veriler

### **2. Frontend (Next.js React)**
- **TypeScript** ile tip güvenliği
- **Tailwind CSS** ile modern tasarım
- **Lucide React** ile ikonlar
- **Responsive Design** ile mobil uyumluluk
- **Search & Filter** ile gelişmiş arama
- **Pagination** ile sayfalama

### **3. API Endpoints**
- **GET** `/api/platform/dangerous-goods` - Liste ve arama
- **GET** `/api/platform/dangerous-goods/{id}` - Detay
- **POST** `/api/platform/dangerous-goods` - Yeni kayıt
- **PUT** `/api/platform/dangerous-goods/{id}` - Güncelleme
- **GET** `/api/platform/dangerous-goods/statistics` - İstatistikler

## 🗄️ **Veritabanı Yapısı**

### **DangerousGoods Tablosu**
```sql
CREATE TABLE "DangerousGoods" (
    "Id" uuid PRIMARY KEY,
    "UNNumber" varchar(10) NOT NULL,
    "ProperShippingName" varchar(200) NOT NULL,
    "TechnicalName" varchar(100),
    "Class" int NOT NULL,
    "SubsidiaryRisk" varchar(10),
    "PackingGroup" int NOT NULL,
    "Labels" varchar(50),
    "SpecialProvisions" varchar(100),
    "LimitedQuantity" varchar(200),
    "ExceptedQuantity" varchar(200),
    "Notes" varchar(500),
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAt" timestamp NOT NULL DEFAULT NOW(),
    "UpdatedAt" timestamp
);
```

### **DangerousGoodsIdentifiers Tablosu**
```sql
CREATE TABLE "DangerousGoodsIdentifiers" (
    "Id" uuid PRIMARY KEY,
    "DangerousGoodsId" uuid NOT NULL REFERENCES "DangerousGoods"("Id"),
    "Scheme" int NOT NULL,
    "Code" varchar(50) NOT NULL,
    "ExtraJson" text
);
```

## 🔧 **Kurulum ve Çalıştırma**

### **1. Backend Kurulumu**
```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

### **2. Frontend Kurulumu**
```bash
cd frontend
npm install
npm run dev
```

### **3. Veritabanı Migration**
```bash
cd backend
dotnet ef database update
```

## 📱 **Kullanım Senaryoları**

### **1. Tehlikeli Mal Ekleme**
1. Super Admin panelinde "Dangerous Goods" sayfasına git
2. "Add New" butonuna tıkla
3. UN Number, Proper Shipping Name, Class, Packing Group bilgilerini gir
4. Gerekli identifier'ları ekle
5. Kaydet

### **2. Tehlikeli Mal Arama**
1. Search box'a mal adı yaz
2. UN Number filter'ı kullan
3. Class filter'ı ile sınıf seç
4. Packing Group filter'ı ile grup seç
5. Sonuçları incele

### **3. Tehlikeli Mal Güncelleme**
1. Listede ilgili malı bul
2. "Edit" butonuna tıkla
3. Bilgileri güncelle
4. Kaydet

### **4. İstatistik Görüntüleme**
1. Dashboard'da istatistik widget'larını incele
2. Total DG Items, Classes, Identifiers sayılarını gör
3. This Month eklenen maddeleri takip et

## 🚨 **Güvenlik ve Uyumluluk**

### **1. IATA DGR (Dangerous Goods Regulations)**
- Havayolu taşımacılığı için standartlar
- Packaging, labeling, documentation gereksinimleri
- Training ve certification gereksinimleri

### **2. IMDG Code (International Maritime Dangerous Goods)**
- Deniz taşımacılığı için standartlar
- Container packing, stowage gereksinimleri
- Emergency procedures

### **3. ADR (European Agreement)**
- Karayolu taşımacılığı için standartlar
- Vehicle requirements, driver training
- Documentation ve labeling

### **4. RID (Railway Regulations)**
- Demiryolu taşımacılığı için standartlar
- Wagon requirements, safety measures
- Emergency response procedures

## 📊 **Raporlama ve Analitik**

### **1. Class-based Statistics**
- Her sınıftan kaç mal var
- En çok hangi sınıf kullanılıyor
- Risk analizi

### **2. Scheme-based Statistics**
- Hangi scheme'ler kullanılıyor
- UN, IATA, IMDG dağılımı
- Compliance tracking

### **3. Monthly Trends**
- Aylık eklenen mal sayısı
- Trend analizi
- Growth tracking

## 🔮 **Gelecek Geliştirmeler**

### **1. Import/Export Functionality**
- CSV/Excel import
- Bulk operations
- Data validation

### **2. Advanced Search**
- Full-text search
- Fuzzy matching
- Saved searches

### **3. Compliance Tracking**
- Regulation updates
- Compliance alerts
- Audit trails

### **4. Mobile App**
- iOS/Android uygulaması
- Offline capability
- Barcode scanning

## 📚 **İlgili Dokümantasyon**

- [IATA Dangerous Goods Regulations](https://www.iata.org/en/programs/cargo/dgr/)
- [IMDG Code](https://www.imo.org/en/OurWork/Safety/Pages/DangerousGoods.aspx)
- [ADR Agreement](https://unece.org/transport/dangerous-goods/adr)
- [UN Recommendations](https://www.unece.org/transport/dangerous-goods/standards.html)

## 🎯 **Sonuç**

Bu sistem, tehlikeli malların güvenli ve uyumlu bir şekilde yönetilmesini sağlar. Uluslararası standartlara uygun olarak tasarlanmış olup, modern web teknolojileri kullanılarak geliştirilmiştir.

Sistem production'da güvenle kullanılabilir! 🚀

---

**Not:** Bu sistem sadece bilgi amaçlıdır. Gerçek tehlikeli mal taşımacılığı için mutlaka uzman danışmanlığı alınmalı ve güncel regülasyonlar takip edilmelidir.
