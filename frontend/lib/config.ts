// API Configuration
export const API_BASE = 'http://localhost:8080';

// Frontend API Endpoints (Next.js API Routes)
export const API_ENDPOINTS = {
  // Locations (Frontend API Routes)
  LOCATIONS: '/api/super/locations',
  LOCATION_STATISTICS: '/api/super/locations/statistics',
  LOCATION_DETAIL: (id: string) => `/api/super/locations/${id}`,
  
  // Dangerous Goods (Frontend API Routes)
  DANGEROUS_GOODS: '/api/super/dangerous-goods',
  DANGEROUS_GOODS_STATISTICS: '/api/super/dangerous-goods/statistics',
  DANGEROUS_GOODS_DETAIL: (id: string) => `/api/super/dangerous-goods/${id}`,
  
  // Dangerous Goods Import (Frontend API Routes)
  DANGEROUS_GOODS_IMPORT: (type: string) => `/api/super/dangerous-goods-import/import/${type}`,
  
  // Location Import (Frontend API Routes)
  LOCATION_IMPORT: (type: string) => `/api/super/location-import/import/${type}`,
  
  // Backend API Endpoints (for direct calls if needed)
  BACKEND: {
    LOCATIONS: `${API_BASE}/api/platform/locations`,
    LOCATION_STATISTICS: `${API_BASE}/api/platform/locations/statistics`,
    LOCATION_COUNTRY_STATISTICS: `${API_BASE}/api/platform/locations/statistics/countries`,
    LOCATION_SCHEME_STATISTICS: `${API_BASE}/api/platform/locations/statistics/schemes`,
    
    // Dangerous Goods
    DANGEROUS_GOODS: `${API_BASE}/api/platform/dangerous-goods`,
    DANGEROUS_GOODS_STATISTICS: `${API_BASE}/api/platform/dangerous-goods/statistics`,
    DANGEROUS_GOODS_CLASS_STATISTICS: `${API_BASE}/api/platform/dangerous-goods/statistics/classes`,
    DANGEROUS_GOODS_SCHEME_STATISTICS: `${API_BASE}/api/platform/dangerous-goods/statistics/schemes`,
    
    // Location Import
    LOCATION_IMPORT: `${API_BASE}/api/platform/location-import/import`,
    
    // Auth
    PING: `${API_BASE}/api/ping`,
  }
} as const;
