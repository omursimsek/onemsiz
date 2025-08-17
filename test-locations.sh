#!/bin/bash

# Locations Sayfası Test Script
# Bu script, locations sayfasının API entegrasyonunu test eder

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfigürasyon
API_BASE="http://localhost:8080"
TOKEN="your-jwt-token-here"  # Bu değeri gerçek JWT token ile değiştirin

echo -e "${BLUE}Locations Sayfası Test${NC}"
echo "=========================="
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

# Test 1: Tüm lokasyonları getir
echo -e "${YELLOW}Test 1: Tüm lokasyonları getir${NC}"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_BASE/api/platform/locations")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Tüm lokasyonlar başarıyla getirildi${NC}"
    location_count=$(echo "$response_body" | jq 'length')
    echo "Toplam lokasyon sayısı: $location_count"
else
    echo -e "${RED}✗ Lokasyonlar getirilemedi (HTTP: $http_code)${NC}"
    echo "Response: $response_body"
fi

echo ""

# Test 2: Search ile filtreleme
echo -e "${YELLOW}Test 2: Search ile filtreleme${NC}"
search_query="ISTANBUL"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_BASE/api/platform/locations?q=$search_query")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Search filtreleme başarılı${NC}"
    search_count=$(echo "$response_body" | jq 'length')
    echo "'$search_query' araması sonucu: $search_count lokasyon"
    
    if [ "$search_count" -gt 0 ]; then
        first_location=$(echo "$response_body" | jq '.[0].name')
        echo "İlk sonuç: $first_location"
    fi
else
    echo -e "${RED}✗ Search filtreleme başarısız (HTTP: $http_code)${NC}"
fi

echo ""

# Test 3: Country ile filtreleme
echo -e "${YELLOW}Test 3: Country ile filtreleme${NC}"
country_filter="TR"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_BASE/api/platform/locations?country=$country_filter")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Country filtreleme başarılı${NC}"
    country_count=$(echo "$response_body" | jq 'length')
    echo "'$country_filter' ülkesinde: $country_count lokasyon"
    
    if [ "$country_count" -gt 0 ]; then
        countries=$(echo "$response_body" | jq -r '.[].countryISO2' | sort | uniq)
        echo "Bulunan ülkeler: $countries"
    fi
else
    echo -e "${RED}✗ Country filtreleme başarısız (HTTP: $http_code)${NC}"
fi

echo ""

# Test 4: Scheme ile filtreleme
echo -e "${YELLOW}Test 4: Scheme ile filtreleme${NC}"
scheme_filter="UNLOCODE"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_BASE/api/platform/locations?scheme=$scheme_filter")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Scheme filtreleme başarılı${NC}"
    scheme_count=$(echo "$response_body" | jq 'length')
    echo "'$scheme_filter' scheme'inde: $scheme_count lokasyon"
    
    if [ "$scheme_count" -gt 0 ]; then
        schemes=$(echo "$response_body" | jq -r '.[].identifiers[].scheme' | sort | uniq)
        echo "Bulunan scheme'ler: $schemes"
    fi
else
    echo -e "${RED}✗ Scheme filtreleme başarısız (HTTP: $http_code)${NC}"
fi

echo ""

# Test 5: Limit ile filtreleme
echo -e "${YELLOW}Test 5: Limit ile filtreleme${NC}"
take_limit="5"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_BASE/api/platform/locations?take=$take_limit")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Limit filtreleme başarılı${NC}"
    limit_count=$(echo "$response_body" | jq 'length')
    echo "Limit $take_limit sonucu: $limit_count lokasyon"
    
    if [ "$limit_count" -gt 0 ]; then
        echo "İlk lokasyon: $(echo "$response_body" | jq -r '.[0].name')"
        echo "Son lokasyon: $(echo "$response_body" | jq -r '.[-1].name')"
    fi
else
    echo -e "${RED}✗ Limit filtreleme başarısız (HTTP: $http_code)${NC}"
fi

echo ""

# Test 6: Kombinasyon filtreleme
echo -e "${YELLOW}Test 6: Kombinasyon filtreleme${NC}"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_BASE/api/platform/locations?country=TR&scheme=UNLOCODE&take=3")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ Kombinasyon filtreleme başarılı${NC}"
    combo_count=$(echo "$response_body" | jq 'length')
    echo "TR + UNLOCODE + limit 3 sonucu: $combo_count lokasyon"
    
    if [ "$combo_count" -gt 0 ]; then
        echo "Lokasyonlar:"
        echo "$response_body" | jq -r '.[] | "  - \(.name) (\(.countryISO2))"'
    fi
else
    echo -e "${RED}✗ Kombinasyon filtreleme başarısız (HTTP: $http_code)${NC}"
fi

echo ""

# Test 7: Tek lokasyon detayı
if [ "$location_count" -gt 0 ]; then
    echo -e "${YELLOW}Test 7: Tek lokasyon detayı${NC}"
    first_location_id=$(echo "$(curl -s -H "Authorization: Bearer $TOKEN" "$API_BASE/api/platform/locations?take=1")" | jq -r '.[0].id')
    
    if [ "$first_location_id" != "null" ] && [ "$first_location_id" != "" ]; then
        response=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $TOKEN" \
            "$API_BASE/api/platform/locations/$first_location_id")
        
        http_code=$(echo "$response" | tail -n1)
        response_body=$(echo "$response" | head -n -1)
        
        if [ "$http_code" -eq 200 ]; then
            echo -e "${GREEN}✓ Lokasyon detayı başarıyla getirildi${NC}"
            location_name=$(echo "$response_body" | jq -r '.name')
            identifiers_count=$(echo "$response_body" | jq '.identifiers | length')
            echo "Lokasyon: $location_name"
            echo "Identifier sayısı: $identifiers_count"
        else
            echo -e "${RED}✗ Lokasyon detayı getirilemedi (HTTP: $http_code)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Lokasyon ID bulunamadı, detay testi atlandı${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Lokasyon bulunamadı, detay testi atlandı${NC}"
fi

echo ""

# Test 8: Statistics hesaplama
echo -e "${YELLOW}Test 8: Statistics hesaplama${NC}"
if [ "$location_count" -gt 0 ]; then
    # Tüm lokasyonları al
    all_locations=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_BASE/api/platform/locations?take=1000")
    
    # Statistics hesapla
    total_locations=$(echo "$all_locations" | jq 'length')
    unique_countries=$(echo "$all_locations" | jq -r '.[].countryISO2' | sort | uniq | wc -l)
    total_identifiers=$(echo "$all_locations" | jq 'reduce (.[].identifiers | length) as $i (0; . + $i)')
    
    echo -e "${GREEN}✓ Statistics hesaplandı${NC}"
    echo "Toplam lokasyon: $total_locations"
    echo "Benzersiz ülke: $unique_countries"
    echo "Toplam identifier: $total_identifiers"
    
    # Bu ay eklenen lokasyonlar
    current_month=$(date +%m)
    current_year=$(date +%Y)
    this_month_locations=$(echo "$all_locations" | jq --arg month "$current_month" --arg year "$current_year" \
        '.[] | select((.createdAt | fromdateiso8601 | .month == ($month | tonumber)) and 
                      (.createdAt | fromdateiso8601 | .year == ($year | tonumber))) | .name' | wc -l)
    
    echo "Bu ay eklenen: $this_month_locations"
else
    echo -e "${YELLOW}⚠ Lokasyon bulunamadı, statistics testi atlandı${NC}"
fi

echo ""
echo -e "${BLUE}Test tamamlandı!${NC}"
echo ""
echo "Sonuçları kontrol etmek için:"
echo "1. Frontend: /super/locations sayfasını ziyaret edin"
echo "2. Backend: Console log'larını kontrol edin"
echo "3. Database: Import edilen verileri kontrol edin"
echo ""
echo "Beklenen davranış:"
echo "- Tüm API endpoint'leri çalışmalı"
echo "- Filtreleme doğru sonuçlar vermeli"
echo "- Pagination düzgün çalışmalı"
echo "- Statistics doğru hesaplanmalı"
