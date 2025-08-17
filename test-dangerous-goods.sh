#!/bin/bash

# Dangerous Goods API Test Script
# Bu script Dangerous Goods API'sinin temel özelliklerini test eder

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_BASE="http://localhost:3000"
BACKEND_API="http://localhost:8080"

echo -e "${BLUE}🚨 Dangerous Goods API Test Script${NC}"
echo "======================================"

# 1. Backend API Test (Direct)
echo -e "\n${YELLOW}Test 1: Backend API Direct Test${NC}"
echo "----------------------------------------"

# Test statistics
echo "📊 Statistics:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/dangerous-goods/statistics")

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

# Test search
echo -e "\n🔍 Search (Empty):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/dangerous-goods?take=10&page=1")

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

# Test statistics
echo "📊 Statistics:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    "$API_BASE/api/super/dangerous-goods/statistics")

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

# Test search
echo -e "\n🔍 Search (Empty):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    "$API_BASE/api/super/dangerous-goods?take=10&page=1")

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

# 3. Sample Data Creation Test
echo -e "\n${YELLOW}Test 3: Sample Data Creation Test${NC}"
echo "----------------------------------------"

# Sample dangerous goods data
SAMPLE_DATA='{
  "unNumber": "UN1203",
  "properShippingName": "GASOLINE",
  "technicalName": "Motor spirit",
  "class": "Class3",
  "subsidiaryRisk": null,
  "packingGroup": "II",
  "labels": "3, 6.1",
  "specialProvisions": null,
  "limitedQuantity": "5L",
  "exceptedQuantity": "30mL",
  "notes": "Flammable liquid, flash point < 23°C",
  "primaryScheme": "UN",
  "primaryCode": "UN1203"
}'

echo "📦 Creating sample dangerous goods:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    -H "Content-Type: application/json" \
    -d "$SAMPLE_DATA" \
    -X POST \
    "$BACKEND_API/api/platform/dangerous-goods")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✅ HTTP 201 Created${NC}"
    echo "Response:"
    echo "$response_body" | head -10
    
    # Extract ID for further tests
    ID=$(echo "$response_body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Created ID: $ID"
    
    # Test get by ID
    echo -e "\n🔍 Get by ID:"
    get_response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer test-token" \
        "$BACKEND_API/api/platform/dangerous-goods/$ID")
    
    get_http_code=$(echo "$get_response" | tail -n1)
    if [ "$get_http_code" = "200" ]; then
        echo -e "${GREEN}✅ Get by ID successful${NC}"
    else
        echo -e "${RED}❌ Get by ID failed: $get_http_code${NC}"
    fi
    
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 4. Search with Data Test
echo -e "\n${YELLOW}Test 4: Search with Data Test${NC}"
echo "----------------------------------------"

# Test search for gasoline
echo "🔍 Search for 'GASOLINE':"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/dangerous-goods?q=GASOLINE&take=10&page=1")

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

# Test search by UN Number
echo -e "\n🔍 Search by UN Number 'UN1203':"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/dangerous-goods?unNumber=UN1203&take=10&page=1")

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

# Test search by Class
echo -e "\n🔍 Search by Class 'Class3':"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/dangerous-goods?dgClass=Class3&take=10&page=1")

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

# 5. Statistics Test
echo -e "\n${YELLOW}Test 5: Statistics Test${NC}"
echo "----------------------------------------"

# Test statistics after data creation
echo "📊 Statistics (after data creation):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/dangerous-goods/statistics")

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

# 6. Summary
echo -e "\n${BLUE}📋 Test Summary${NC}"
echo "================"
echo "✅ Backend API: Tested"
echo "✅ Frontend API Route: Tested"
echo "✅ Data Creation: Tested"
echo "✅ Search Functionality: Tested"
echo "✅ Statistics: Tested"
echo ""
echo -e "${GREEN}🎉 Dangerous Goods API test completed!${NC}"
echo ""
echo -e "${YELLOW}💡 Test Notes:${NC}"
echo "- Backend should be running on port 8080"
echo "- Frontend should be running on port 3000"
echo "- Sample data created: UN1203 - GASOLINE"
echo "- All endpoints should return 200/201 status codes"
echo "- Statistics should show at least 1 dangerous goods item"
