'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, Globe, Hash, Calendar, Eye } from 'lucide-react';
import { API_ENDPOINTS } from '../../../lib/config';

interface Location {
  id: string;
  name: string;
  nameAscii?: string;
  countryISO2: string;
  subdivision?: string;
  kind: string;
  isActive: boolean;
  createdAt: string;
  identifiers: Identifier[];
}

interface Identifier {
  id: string;
  scheme: string;
  code: string;
  extraJson?: string;
}

interface LocationStatistics {
  totalLocations: number;
  uniqueCountries: number;
  totalIdentifiers: number;
  thisMonthLocations: number;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<LocationStatistics | null>(null);
  
  // Search ve filter state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [schemeFilter, setSchemeFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [take, setTake] = useState(50);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Statistics yükle
  const fetchStatistics = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.LOCATION_STATISTICS);
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Statistics yüklenemedi:', err);
    }
  };

  // Lokasyonları yükle
  const fetchLocations = async (resetPage: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (countryFilter) params.append('country', countryFilter);
      if (schemeFilter) params.append('scheme', schemeFilter);
      if (codeFilter) params.append('code', codeFilter);
      params.append('take', take.toString());
      params.append('page', currentPage.toString());
      
      const response = await fetch(`${API_ENDPOINTS.LOCATIONS}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug için
      console.log('Current Page:', currentPage); // Debug için
      setLocations(data.locations);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPrevPage(data.hasPrevPage);
      
      // Sadece filter değişikliklerinde sayfa 1'e reset et
      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Component mount'ta ve filter değişikliklerinde veri yükle
  useEffect(() => {
    fetchLocations(true);
    fetchStatistics();
  }, [countryFilter, schemeFilter, codeFilter, take]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLocations(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, countryFilter, schemeFilter, codeFilter, take]);

  // currentPage değişikliklerinde veri yükle
  useEffect(() => {
    if (currentPage > 1) { // İlk yüklemede çalışmasın
      fetchLocations(false);
    }
  }, [currentPage]);

  // Filter'ları temizle
  const clearFilters = () => {
    setSearchQuery('');
    setCountryFilter('');
    setSchemeFilter('');
    setCodeFilter('');
    setTake(50);
    setCurrentPage(1);
    fetchLocations(true);
  };

  // Scheme enum'larını göster
  const getSchemeDisplayName = (scheme: string) => {
    const schemeNames: Record<string, string> = {
      'UNLOCODE': 'UN-LOCODE',
      'UIC': 'UIC Code',
      'RNE': 'RNE Code',
      'IATA': 'IATA Code',
      'Custom': 'Custom'
    };
    return schemeNames[scheme] || scheme;
  };

  // Kind enum'larını göster
  const getKindDisplayName = (kind: string) => {
    const kindNames: Record<string, string> = {
      'Station': 'Station',
      'Port': 'Port',
      'Airport': 'Airport',
      'Border': 'Border'
    };
    return kindNames[kind] || kind;
  };

  if (loading && locations.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Locations</h1>
        <p className="text-gray-600">
          Sistemde yüklenen tüm lokasyonları görüntüleyin ve yönetin.
        </p>
      </div>

      {/* Statistics Widget */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.totalLocations || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.uniqueCountries || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Hash className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Identifiers</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.totalIdentifiers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.thisMonthLocations || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search ve Filters */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="inline w-4 h-4 mr-1" />
              Search
            </label>
            <input
              type="text"
              placeholder="Lokasyon adı veya açıklama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="inline w-4 h-4 mr-1" />
              Country
            </label>
            <input
              type="text"
              placeholder="TR, US, DE..."
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Scheme Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Hash className="inline w-4 h-4 mr-1" />
              Scheme
            </label>
            <select
              value={schemeFilter}
              onChange={(e) => setSchemeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Schemes</option>
              <option value="UNLOCODE">UN-LOCODE</option>
              <option value="UIC">UIC Code</option>
              <option value="RNE">RNE Code</option>
              <option value="IATA">IATA Code</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Take Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <select
              value={take}
              onChange={(e) => setTake(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {totalCount} lokasyon bulundu (Sayfa {currentPage} / {totalPages})
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Locations Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {locations.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || countryFilter || schemeFilter 
                ? 'Try adjusting your search criteria.' 
                : 'Get started by importing some locations.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Identifiers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {location.name}
                        </div>
                        {location.nameAscii && location.nameAscii !== location.name && (
                          <div className="text-sm text-gray-500">
                            {location.nameAscii}
                          </div>
                        )}
                        {location.subdivision && (
                          <div className="text-xs text-gray-400">
                            {location.subdivision}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {location.countryISO2}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {getKindDisplayName(location.kind)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {location.identifiers.map((identifier) => (
                          <div key={identifier.id} className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {getSchemeDisplayName(identifier.scheme)}
                            </span>
                            <span className="text-xs text-gray-600 font-mono">
                              {identifier.code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        location.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(location.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/super/locations/${location.id}`}>
                        <button className="text-blue-600 hover:text-blue-900 flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * take) + 1} to {Math.min(currentPage * take, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center space-x-2">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={!hasPrevPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!hasPrevPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            {/* Next Page */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!hasNextPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            
            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={!hasNextPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
