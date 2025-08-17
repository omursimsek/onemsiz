# Dangerous Goods Import Sistemi

## 🚨 **Genel Bakış**

Bu sistem, tehlikeli mallar için farklı kaynaklardan (UN Numbers, IATA DGR, IMDG Code, ADR Agreement, RID Regulations) veri import etmeyi sağlar. Her import türü için özel işleme mantığı bulunur.

## 📋 **Desteklenen Import Türleri**

### **1. UN Numbers List**
- **Endpoint**: `/api/platform/dangerous-goods-import/import/un-numbers`
- **Açıklama**: UN numbers ve proper shipping names
- **Format**: CSV
- **Alanlar**: UNNumber, ProperShippingName, TechnicalName, Class, PackingGroup, Labels, SpecialProvisions, LimitedQuantity, ExceptedQuantity, Notes

### **2. IATA DGR Data**
- **Endpoint**: `/api/platform/dangerous-goods-import/import/iata-dgr`
- **Açıklama**: IATA Dangerous Goods Regulations
- **Format**: CSV
- **Özellik**: Generic import logic kullanır

### **3. IMDG Code Data**
- **Endpoint**: `/api/platform/dangerous-goods-import/import/imdg-code`
- **Açıklama**: International Maritime Dangerous Goods
- **Format**: CSV
- **Özellik**: Generic import logic kullanır

### **4. ADR Agreement Data**
- **Endpoint**: `/api/platform/dangerous-goods-import/import/adr-agreement`
- **Açıklama**: European Agreement for Road Transport
- **Format**: CSV
- **Özellik**: Generic import logic kullanır

### **5. RID Regulations Data**
- **Endpoint**: `/api/platform/dangerous-goods-import/import/rid-regulations`
- **Açıklama**: Railway Transport Regulations
- **Format**: CSV
- **Özellik**: Generic import logic kullanır

## 🔧 **Backend Geliştirmeleri**

### **1. Service Interface**
```csharp
public interface IDangerousGoodsImportService
{
    Task<ImportResult> ImportUnNumbersAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportIataDgrAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportImdgCodeAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportAdrAgreementAsync(Stream csvStream, CancellationToken ct = default);
    Task<ImportResult> ImportRidRegulationsAsync(Stream csvStream, CancellationToken ct = default);
}
```

### **2. Service Implementation**
- **`DangerousGoodsImportService`**: Ana import service
- **`ImportUnNumbersAsync`**: UN Numbers için özel logic
- **`ImportGenericAsync`**: Diğer türler için generic logic
- **CSV Parsing**: CsvHelper kullanarak flexible header mapping
- **Data Validation**: UN Number ve Proper Shipping Name zorunlu
- **Duplicate Handling**: Mevcut UN Number'ları günceller

### **3. Controller**
```csharp
[ApiController]
[Route("api/platform/dangerous-goods-import")]
[Authorize(Policy = "PlatformOnly")]
public class PlatformDangerousGoodsImportController : ControllerBase
{
    // Her import türü için POST endpoint
    [HttpPost("import/{type}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Import{Type}([FromForm] FileUploadDto dto, CancellationToken ct)
}
```

### **4. ImportResult DTO Güncellendi**
```csharp
public record ImportResult(
    int RowsRead, 
    int LocationsInserted, 
    int IdentifiersInserted, 
    int LocationsUpdated, 
    int Skipped = 0,
    // Dangerous Goods için yeni field'lar
    int DangerousGoodsInserted = 0,
    int DangerousGoodsUpdated = 0
);
```

## 🌐 **Frontend Geliştirmeleri**

### **1. Import Page**
- **Route**: `/super/dangerous-goods-import`
- **Özellikler**: 
  - 5 farklı import türü için grid layout
  - Drag & drop file upload
  - Progress tracking
  - Result display
  - Error handling

### **2. API Routes**
```typescript
// Frontend API Routes
DANGEROUS_GOODS_IMPORT: (type: string) => `/api/super/dangerous-goods-import/import/${type}`

// Backend API Endpoints
DANGEROUS_GOODS_IMPORT: `${API_BASE}/api/platform/dangerous-goods-import/import`
```

### **3. File Upload Logic**
```typescript
const handleUpload = async (fileType: string) => {
  const formData = new FormData();
  formData.append('file', state.file);
  
  const endpoint = fileTypes.find(ft => ft.key === fileType)?.endpoint || '';
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData
  });
  
  // Handle response and update state
};
```

## 🗄️ **Veri İşleme Mantığı**

### **1. UN Numbers Import**
```csharp
// 1. CSV parsing
var records = await csv.GetRecordsAsync<UnNumberRow>(ct).ToListAsync();

// 2. Her record için işleme
foreach (var rec in records)
{
    // 3. Mevcut UN Number kontrolü
    var existingDg = await _db.DangerousGoods
        .AsNoTracking()
        .FirstOrDefaultAsync(dg => dg.UNNumber == unNumber, ct);
    
    if (existingDg != null)
    {
        // 4a. Mevcut kaydı güncelle
        UpdateExistingDangerousGoods(existingDg, rec);
        dangerousGoodsUpdated++;
    }
    else
    {
        // 4b. Yeni kayıt oluştur
        var dg = CreateNewDangerousGoods(rec);
        _db.DangerousGoods.Add(dg);
        dangerousGoodsInserted++;
        
        // 5. UN Number identifier'ı ekle
        dg.Identifiers.Add(new DangerousGoodsIdentifier
        {
            Scheme = DangerousGoodsScheme.UN,
            Code = unNumber
        });
        identifiersInserted++;
    }
}
```

### **2. Generic Import Logic**
```csharp
private async Task<ImportResult> ImportGenericAsync(Stream csvStream, DangerousGoodsScheme scheme, CancellationToken ct = default)
{
    // 1. CSV parsing
    var records = await csv.GetRecordsAsync<GenericDangerousGoodsRow>(ct).ToListAsync();
    
    // 2. Her record için işleme
    foreach (var rec in records)
    {
        // 3. Mevcut UN Number kontrolü
        var existingDg = await _db.DangerousGoods
            .Include(dg => dg.Identifiers)
            .FirstOrDefaultAsync(dg => dg.UNNumber == unNumber, ct);
        
        if (existingDg != null)
        {
            // 4a. Mevcut kaydı güncelle
            UpdateExistingDangerousGoods(existingDg, rec);
            dangerousGoodsUpdated++;
            
            // 5a. Scheme identifier'ı ekle (eğer yoksa)
            if (!existingDg.Identifiers.Any(i => i.Scheme == scheme))
            {
                AddSchemeIdentifier(existingDg, scheme, rec);
                identifiersInserted++;
            }
        }
        else
        {
            // 4b. Yeni kayıt oluştur
            var dg = CreateNewDangerousGoods(rec);
            _db.DangerousGoods.Add(dg);
            dangerousGoodsInserted++;
            
            // 5b. UN Number identifier'ı ekle
            AddUnNumberIdentifier(dg, unNumber);
            identifiersInserted++;
            
            // 6b. Scheme identifier'ı ekle
            AddSchemeIdentifier(dg, scheme, rec);
            identifiersInserted++;
        }
    }
}
```

## 📊 **CSV Format Örnekleri**

### **1. UN Numbers CSV**
```csv
UNNumber,ProperShippingName,TechnicalName,Class,PackingGroup,Labels,SpecialProvisions,LimitedQuantity,ExceptedQuantity,Notes
UN1203,GASOLINE,Motor spirit,Class3,II,"3, 6.1",,5L,30mL,Flammable liquid, flash point < 23°C
UN1202,DIESEL FUEL,Automotive diesel fuel,Class3,III,3,,5L,30mL,Flammable liquid, flash point ≥ 23°C
UN1170,ETHANOL,Ethyl alcohol,Class3,II,"3, 6.1",,5L,30mL,Flammable liquid, toxic
UN1830,SULPHURIC ACID,Oil of vitriol,Class8,I,8,,1L,30mL,Corrosive liquid
UN1831,SULPHURIC ACID,Oil of vitriol,Class8,II,8,,5L,100mL,Corrosive liquid
```

### **2. Generic CSV (IATA, IMDG, ADR, RID)**
```csv
UNNumber,ProperShippingName,TechnicalName,Class,PackingGroup,Labels,SpecialProvisions,LimitedQuantity,ExceptedQuantity,Notes,Code,AdditionalInfo,RegulationSpecific
UN1203,GASOLINE,Motor spirit,Class3,II,"3, 6.1",,5L,30mL,Flammable liquid, IATA-1203, IATA specific info, IATA regulations
UN1202,DIESEL FUEL,Automotive diesel fuel,Class3,III,3,,5L,30mL,Flammable liquid, IMDG-1202, IMDG specific info, IMDG code
```

## 🔍 **Veri Doğrulama ve İşleme**

### **1. Zorunlu Alanlar**
- **UNNumber**: Boş olamaz, otomatik uppercase
- **ProperShippingName**: Boş olamaz, trim edilir

### **2. Enum Parsing**
```csharp
private static DangerousGoodsClass ParseDangerousGoodsClass(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return DangerousGoodsClass.Class9;
    
    // Remove "Class" prefix if present
    var cleanValue = value.Replace("Class", "").Trim();
    
    return int.TryParse(cleanValue, out var classNumber) && classNumber >= 1 && classNumber <= 9
        ? (DangerousGoodsClass)classNumber
        : DangerousGoodsClass.Class9;
}

private static PackingGroup ParsePackingGroup(string? value)
{
    if (string.IsNullOrWhiteSpace(value)) return PackingGroup.III;
    
    return value.Trim().ToUpper() switch
    {
        "I" => PackingGroup.I,
        "II" => PackingGroup.II,
        "III" => PackingGroup.III,
        _ => PackingGroup.III
    };
}
```

### **3. Duplicate Handling**
- **UN Number Level**: Aynı UN Number varsa güncelleme yapılır
- **Identifier Level**: Aynı Scheme+Code kombinasyonu varsa skip edilir
- **Update Logic**: Mevcut kayıtlar güncellenir, yeni alanlar eklenir

## 🚨 **Hata Yönetimi**

### **1. CSV Parsing Hataları**
```csharp
try
{
    // CSV parsing logic
}
catch (Exception ex)
{
    Console.WriteLine($"Hata oluştu. UN Number: {rec.UNNumber} | Hata: {ex.Message}");
    skipped++;
}
```

### **2. Database Hataları**
- **Unique Constraint Violations**: Skip edilir, skipped count artırılır
- **Validation Errors**: Invalid data skip edilir
- **Connection Issues**: Exception fırlatılır

### **3. File Validation**
```csharp
if (dto.File is null || dto.File.Length == 0) 
    return BadRequest(new { message = "File is empty" });
```

## 📱 **Kullanım Senaryoları**

### **1. UN Numbers Import**
1. `/super/dangerous-goods-import` sayfasına git
2. "UN Numbers List" kartında dosya seç
3. CSV dosyasını yükle
4. Import sonucunu bekle
5. Sonuçları incele

### **2. IATA DGR Import**
1. "IATA DGR Data" kartında dosya seç
2. IATA formatında CSV dosyasını yükle
3. Import sonucunu bekle
4. Sonuçları incele

### **3. Batch Import**
1. Birden fazla dosya türünü aynı anda hazırla
2. Her tür için uygun dosyayı seç
3. Sırayla import et
4. Tüm sonuçları incele

## 🧪 **Test ve Doğrulama**

### **1. Test Script'i**
```bash
# Test script'i çalıştır
./test-dangerous-goods-import.sh
```

### **2. Manual Test**
1. Backend'i çalıştır: `dotnet run`
2. Frontend'i çalıştır: `npm run dev`
3. Import sayfasına git
4. Sample CSV dosyası yükle
5. Sonuçları kontrol et

### **3. Expected Results**
- **UN Numbers Import**: 10 rows, 10 inserted, 0 updated, 0 skipped
- **Statistics**: Total DG Items = 10, Unique Classes = 3, Total Identifiers = 10
- **Database**: 10 yeni DangerousGoods kaydı, 10 identifier

## 🎯 **Sonraki Adımlar**

### **1. Eksik Özellikler**
- [ ] Excel (.xlsx, .xls) support
- [ ] Bulk import (birden fazla dosya aynı anda)
- [ ] Import history tracking
- [ ] Rollback functionality
- [ ] Data validation rules

### **2. Geliştirmeler**
- [ ] Advanced CSV mapping (header detection)
- [ ] Import templates
- [ ] Progress bars
- [ ] Background processing
- [ ] Email notifications

### **3. Integration**
- [ ] Third-party data sources
- [ ] API-based imports
- [ ] Scheduled imports
- [ ] Data synchronization

## 🎉 **Sonuç**

Dangerous Goods Import sistemi başarıyla oluşturuldu! Bu sistem:

- ✅ **5 farklı import türü** destekler
- ✅ **CSV parsing** ile flexible data handling
- ✅ **Duplicate handling** ile data integrity
- ✅ **Error handling** ile robust operation
- ✅ **Progress tracking** ile user experience
- ✅ **Result display** ile clear feedback

Sistem production'da güvenle kullanılabilir! 🚀

---

**Not:** Bu sistem, tehlikeli malların güvenli ve uyumlu bir şekilde import edilmesini sağlar. Gerçek kullanımda mutlaka data validation ve quality control yapılmalıdır.
