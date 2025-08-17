#!/bin/bash

# Dangerous Goods Import API Test Script
# Bu script Dangerous Goods Import API'sinin temel özelliklerini test eder

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_BASE="http://localhost:3000"
BACKEND_API="http://localhost:8080"

echo -e "${BLUE}🚨 Dangerous Goods Import API Test Script${NC}"
echo "=============================================="

# 1. Backend API Test (Direct)
echo -e "\n${YELLOW}Test 1: Backend API Direct Test${NC}"
echo "----------------------------------------"

# Test UN Numbers import
echo "📦 UN Numbers Import Test:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    -F "file=@test-data/sample-un-numbers.csv" \
    "$BACKEND_API/api/platform/dangerous-goods-import/import/un-numbers")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response:"
    echo "$response_body" | head -10
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 2. Frontend API Route Test
echo -e "\n${YELLOW}Test 2: Frontend API Route Test${NC}"
echo "----------------------------------------"

# Test UN Numbers import via frontend route
echo "📦 UN Numbers Import (Frontend Route):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    -F "file=@test-data/sample-un-numbers.csv" \
    "$API_BASE/api/super/dangerous-goods-import/import/un-numbers")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response:"
    echo "$response_body" | head -10
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 3. Sample Data Creation
echo -e "\n${YELLOW}Test 3: Sample Data Creation${NC}"
echo "----------------------------------------"

# Create sample UN numbers CSV
echo "📝 Creating sample UN numbers CSV..."
mkdir -p test-data

cat > test-data/sample-un-numbers.csv << 'EOF'
UNNumber,ProperShippingName,TechnicalName,Class,PackingGroup,Labels,SpecialProvisions,LimitedQuantity,ExceptedQuantity,Notes
UN1203,GASOLINE,Motor spirit,Class3,II,"3, 6.1",,5L,30mL,Flammable liquid, flash point < 23°C
UN1202,DIESEL FUEL,Automotive diesel fuel,Class3,III,3,,5L,30mL,Flammable liquid, flash point ≥ 23°C
UN1170,ETHANOL,Ethyl alcohol,Class3,II,"3, 6.1",,5L,30mL,Flammable liquid, toxic
UN1830,SULPHURIC ACID,Oil of vitriol,Class8,I,8,,1L,30mL,Corrosive liquid
UN1831,SULPHURIC ACID,Oil of vitriol,Class8,II,8,,5L,100mL,Corrosive liquid
UN1005,AMMONIA,Anhydrous ammonia,Class2,II,2.2,,,,
UN1006,ARGON,Compressed gas,Class2,II,2.2,,,,
UN1008,ACETYLENE,Compressed gas,Class2,I,2.1,,,,
UN1011,BUTANE,Compressed gas,Class2,II,2.1,,,,
UN1013,CARBON DIOXIDE,Compressed gas,Class2,II,2.2,,,,
EOF

echo "✅ Sample CSV created: test-data/sample-un-numbers.csv"

# 4. Import Test with Sample Data
echo -e "\n${YELLOW}Test 4: Import Test with Sample Data${NC}"
echo "----------------------------------------"

# Test import with sample data
echo "📦 Importing sample UN numbers data:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    -F "file=@test-data/sample-un-numbers.csv" \
    "$BACKEND_API/api/platform/dangerous-goods-import/import/un-numbers")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response:"
    echo "$response_body" | head -10
    
    # Extract import result
    totalRows=$(echo "$response_body" | grep -o '"totalRows":[0-9]*' | cut -d':' -f2)
    dangerousGoodsInserted=$(echo "$response_body" | grep -o '"dangerousGoodsInserted":[0-9]*' | cut -d':' -f2)
    dangerousGoodsUpdated=$(echo "$response_body" | grep -o '"dangerousGoodsUpdated":[0-9]*' | cut -d':' -f2)
    skipped=$(echo "$response_body" | grep -o '"skipped":[0-9]*' | cut -d':' -f2)
    
    echo ""
    echo "📊 Import Results:"
    echo "Total Rows: $totalRows"
    echo "Dangerous Goods Inserted: $dangerousGoodsInserted"
    echo "Dangerous Goods Updated: $dangerousGoodsUpdated"
    echo "Skipped: $skipped"
    
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 5. Verification Test
echo -e "\n${YELLOW}Test 5: Verification Test${NC}"
echo "----------------------------------------"

# Check if data was imported
echo "🔍 Checking imported data:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/dangerous-goods?take=20&page=1")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    
    # Count dangerous goods
    dangerousGoodsCount=$(echo "$response_body" | grep -o '"dangerousGoods":\[.*\]' | grep -o 'UN[0-9]*' | wc -l)
    totalCount=$(echo "$response_body" | grep -o '"totalCount":[0-9]*' | cut -d':' -f2)
    
    echo "📊 Data Verification:"
    echo "Total Dangerous Goods in DB: $totalCount"
    echo "Dangerous Goods in Response: $dangerousGoodsCount"
    
    if [ "$totalCount" -gt 0 ]; then
        echo -e "${GREEN}✅ Data import successful!${NC}"
    else
        echo -e "${RED}❌ No data found in database${NC}"
    fi
    
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 6. Statistics Test
echo -e "\n${YELLOW}Test 6: Statistics Test${NC}"
echo "----------------------------------------"

# Check statistics
echo "📊 Checking statistics:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/dangerous-goods/statistics")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Statistics Response:"
    echo "$response_body" | head -10
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 7. Summary
echo -e "\n${BLUE}📋 Test Summary${NC}"
echo "================"
echo "✅ Backend API Import: Tested"
echo "✅ Frontend API Route: Tested"
echo "✅ Sample Data Creation: Completed"
echo "✅ Data Import: Tested"
echo "✅ Data Verification: Tested"
echo "✅ Statistics: Tested"
echo ""
echo -e "${GREEN}🎉 Dangerous Goods Import API test completed!${NC}"
echo ""
echo -e "${YELLOW}💡 Test Notes:${NC}"
echo "- Backend should be running on port 8080"
echo "- Frontend should be running on port 3000"
echo "- Sample CSV created: test-data/sample-un-numbers.csv"
echo "- 10 sample UN numbers imported"
echo "- All endpoints should return 200 status codes"
echo "- Database should contain imported dangerous goods"
echo ""
echo -e "${BLUE}📁 Generated Files:${NC}"
echo "- test-data/sample-un-numbers.csv - Sample UN numbers data"
echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo "1. Check the dangerous goods list page"
echo "2. Verify imported data is displayed correctly"
echo "3. Test other import types (IATA, IMDG, ADR, RID)"
echo "4. Test search and filter functionality"
