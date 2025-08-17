#!/bin/bash

# Pagination Debug Test Script
# Bu script locations API'sinin pagination özelliğini debug eder

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_BASE="http://localhost:3000"
BACKEND_API="http://localhost:8080"

echo -e "${BLUE}🔍 Locations Pagination Debug Script${NC}"
echo "======================================"

# 1. Backend API Test (Direct)
echo -e "\n${YELLOW}Test 1: Backend API Direct Pagination${NC}"
echo "----------------------------------------"

# Test page 1
echo "📄 Page 1 (take=10):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/locations?take=10&page=1")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response structure:"
    echo "$response_body" | jq 'keys' 2>/dev/null || echo "jq not available, raw response:"
    echo "$response_body" | head -20
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# Test page 2
echo -e "\n📄 Page 2 (take=10):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer test-token" \
    "$BACKEND_API/api/platform/locations?take=10&page=2")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response structure:"
    echo "$response_body" | jq 'keys' 2>/dev/null || echo "jq not available, raw response:"
    echo "$response_body" | head -20
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 2. Frontend API Route Test
echo -e "\n${YELLOW}Test 2: Frontend API Route Pagination${NC}"
echo "----------------------------------------"

# Test page 1
echo "📄 Page 1 (take=10):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    "$API_BASE/api/super/locations?take=10&page=1")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response structure:"
    echo "$response_body" | jq 'keys' 2>/dev/null || echo "jq not available, raw response:"
    echo "$response_body" | head -20
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# Test page 2
echo -e "\n📄 Page 2 (take=10):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    "$API_BASE/api/super/locations?take=10&page=2")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response structure:"
    echo "$response_body" | jq 'keys' 2>/dev/null || echo "jq not available, raw response:"
    echo "$response_body" | head -20
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 3. Response Structure Analysis
echo -e "\n${YELLOW}Test 3: Response Structure Analysis${NC}"
echo "----------------------------------------"

echo "🔍 Expected Response Structure:"
echo "{
  \"locations\": [...],
  \"totalCount\": 123,
  \"totalPages\": 13,
  \"currentPage\": 2,
  \"take\": 10,
  \"hasNextPage\": true,
  \"hasPrevPage\": true
}"

echo -e "\n🔍 Actual Response Structure (Page 1):"
response=$(curl -s "$BACKEND_API/api/platform/locations?take=10&page=1")
echo "$response" | jq 'keys' 2>/dev/null || echo "$response" | head -10

echo -e "\n🔍 Actual Response Structure (Page 2):"
response=$(curl -s "$BACKEND_API/api/platform/locations?take=10&page=2")
echo "$response" | jq 'keys' 2>/dev/null || echo "$response" | head -10

# 4. Data Count Analysis
echo -e "\n${YELLOW}Test 4: Data Count Analysis${NC}"
echo "----------------------------------------"

echo "📊 Page 1 Data Count:"
response=$(curl -s "$BACKEND_API/api/platform/locations?take=10&page=1")
locations_count=$(echo "$response" | jq '.locations | length' 2>/dev/null || echo "jq not available")
echo "Locations count: $locations_count"

echo -e "\n📊 Page 2 Data Count:"
response=$(curl -s "$BACKEND_API/api/platform/locations?take=10&page=2")
locations_count=$(echo "$response" | jq '.locations | length' 2>/dev/null || echo "jq not available")
echo "Locations count: $locations_count"

# 5. Summary
echo -e "\n${BLUE}📋 Debug Summary${NC}"
echo "================"
echo "✅ Backend API Pagination: Tested"
echo "✅ Frontend API Route: Tested"
echo "✅ Response Structure: Analyzed"
echo "✅ Data Count: Analyzed"
echo ""
echo -e "${GREEN}🎉 Pagination debug completed!${NC}"
echo ""
echo -e "${YELLOW}💡 Debug Notes:${NC}"
echo "- Check browser console for frontend logs"
echo "- Verify backend response structure matches expected"
echo "- Ensure locations array is not empty on page 2+"
echo "- Check if totalCount, totalPages are correct"
echo "- Verify currentPage in response matches request"
