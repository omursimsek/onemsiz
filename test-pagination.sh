#!/bin/bash

# Pagination Test Script
# Bu script locations API'sinin pagination özelliğini test eder

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
API_BASE="http://localhost:3000"
BACKEND_API="http://localhost:8080"

echo -e "${BLUE}🚀 Locations Pagination Test Script${NC}"
echo "=================================="

# 1. Frontend API Route Test (Cookie-based)
echo -e "\n${YELLOW}Test 1: Frontend API Route Pagination${NC}"
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
    echo "Response: $response_body" | jq '.' 2>/dev/null || echo "$response_body"
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
    echo "Response: $response_body" | jq '.' 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 2. Backend API Test (Direct)
echo -e "\n${YELLOW}Test 2: Backend API Direct Pagination${NC}"
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
    echo "Response: $response_body" | jq '.' 2>/dev/null || echo "$response_body"
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
    echo "Response: $response_body" | jq '.' 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 3. Pagination Parameters Test
echo -e "\n${YELLOW}Test 3: Pagination Parameters${NC}"
echo "----------------------------------------"

# Test different take values
echo "📊 Take=5, Page=1:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    "$API_BASE/api/super/locations?take=5&page=1")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response: $response_body" | jq '.' 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# Test with filters
echo -e "\n🔍 With Country Filter (TR), Take=10, Page=1:"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    "$API_BASE/api/super/locations?country=TR&take=10&page=1")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
    echo "Response: $response_body" | jq '.' 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 4. Error Cases Test
echo -e "\n${YELLOW}Test 4: Error Cases${NC}"
echo "----------------------------------------"

# Test invalid page number
echo "🚫 Invalid Page (-1):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    "$API_BASE/api/super/locations?take=10&page=-1")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK (should handle negative page)${NC}"
    echo "Response: $response_body" | jq '.' 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# Test invalid take value
echo -e "\n🚫 Invalid Take (0):"
response=$(curl -s -w "\n%{http_code}" \
    -H "Cookie: b2b_token=test-token" \
    "$API_BASE/api/super/locations?take=0&page=1")

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✅ HTTP 200 OK (should handle zero take)${NC}"
    echo "Response: $response_body" | jq '.' 2>/dev/null || echo "$response_body"
else
    echo -e "${RED}❌ HTTP $http_code${NC}"
    echo "Response: $response_body"
fi

# 5. Summary
echo -e "\n${BLUE}📋 Test Summary${NC}"
echo "================"
echo "✅ Frontend API Route Pagination: Tested"
echo "✅ Backend API Direct Pagination: Tested"
echo "✅ Pagination Parameters: Tested"
echo "✅ Error Cases: Tested"
echo ""
echo -e "${GREEN}🎉 Pagination test completed!${NC}"
echo ""
echo -e "${YELLOW}💡 Notes:${NC}"
echo "- Make sure backend is running on port 8080"
echo "- Make sure frontend is running on port 3000"
echo "- Update 'test-token' with a valid JWT token"
echo "- Check that pagination metadata is returned correctly"
echo "- Verify that page navigation works in the UI"
