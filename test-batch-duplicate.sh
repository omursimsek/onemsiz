#!/bin/bash

# UN-LOCODE Batch Duplicate Handling Test Script
# Bu script, batch processing'de duplicate handling'i test eder

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigürasyon
API_BASE="http://localhost:8080"
TOKEN="your-jwt-token-here"  # Bu değeri gerçek JWT token ile değiştirin

echo -e "${BLUE}UN-LOCODE Batch Duplicate Handling Test${NC}"
echo "=============================================="
echo ""

# Token kontrolü
if [ "$TOKEN" = "your-jwt-token-here" ]; then
    echo -e "${RED}HATA: Lütfen TOKEN değişkenini gerçek JWT token ile güncelleyin${NC}"
    echo "TOKEN değişkenini güncellemek için:"
    echo "1. Sisteme login olun"
    echo "2. JWT token'ı alın"
    echo "3. Bu script'te TOKEN değişkenini güncelleyin"
    exit 1
fi

# API bağlantı testi
echo -e "${YELLOW}API bağlantısı test ediliyor...${NC}"
if curl -s "$API_BASE/api/ping" > /dev/null; then
    echo -e "${GREEN}✓ API bağlantısı başarılı${NC}"
else
    echo -e "${RED}✗ API bağlantısı başarısız${NC}"
    echo "Backend servisinin çalıştığından emin olun"
    exit 1
fi

echo ""

# Test dosyası
TEST_FILE="test-data/sample-unlocode-batch-duplicate.csv"
FILE_TYPE="unlocode"

if [ ! -f "$TEST_FILE" ]; then
    echo -e "${RED}✗ Test dosyası bulunamadı: $TEST_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Batch Duplicate Handling Test${NC}"
echo "Dosya: $TEST_FILE"
echo "Dosya boyutu: $(wc -l < "$TEST_FILE") satır"
echo ""

# Duplicate analizi
echo -e "${BLUE}Dosya içeriği analizi:${NC}"
echo "Benzersiz UNLOCODE kodları:"
awk -F',' 'NR>1 {print $1$2}' "$TEST_FILE" | sort | uniq -c | sort -nr
echo ""

# Import işlemi
echo -e "${YELLOW}Import işlemi başlatılıyor...${NC}"
response=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$TEST_FILE" \
    "$API_BASE/api/platform/location-import/import/$FILE_TYPE")

# HTTP status code'u al
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Import başarılı${NC}"
    echo "Response: $response_body"
    
    # Sonuç analizi
    echo ""
    echo -e "${BLUE}Sonuç Analizi:${NC}"
    echo "$response_body" | jq -r '. | "Total Rows: \(.totalRows)"'
    echo "$response_body" | jq -r '. | "Locations Inserted: \(.locationsInserted)"'
    echo "$response_body" | jq -r '. | "Identifiers Inserted: \(.identifiersInserted)"'
    echo "$response_body" | jq -r '. | "Locations Updated: \(.locationsUpdated)"'
    echo "$response_body" | jq -r '. | "Skipped: \(.skipped)"'
    
    # Beklenen sonuçlar
    echo ""
    echo -e "${BLUE}Beklenen Sonuçlar:${NC}"
    echo "Total Rows: 18 (tüm satırlar)"
    echo "Locations Inserted: 8 (benzersiz lokasyonlar)"
    echo "Identifiers Inserted: 8 (benzersiz UNLOCODE kodları)"
    echo "Locations Updated: 0 (güncelleme yok)"
    echo "Skipped: 10 (duplicate kayıtlar)"
    
else
    echo -e "${RED}✗ Import başarısız (HTTP: $http_code)${NC}"
    echo "Response: $response_body"
fi

echo ""
echo -e "${BLUE}Test tamamlandı!${NC}"
echo ""
echo "Sonuçları kontrol etmek için:"
echo "1. Frontend: /super/location-import sayfasını ziyaret edin"
echo "2. Backend: Database'de import edilen verileri kontrol edin"
echo "3. Console: Backend log çıktılarını kontrol edin"
echo ""
echo "Beklenen davranış:"
echo "- Aynı batch içinde duplicate kodlar skip edilmeli"
echo "- Database'de unique constraint ihlali olmamalı"
echo "- Skip edilen kayıt sayısı doğru hesaplanmalı"
