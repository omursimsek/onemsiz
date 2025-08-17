'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, AlertTriangle, Hash, Calendar, Eye, Flame, Droplets, Zap } from 'lucide-react';
import { API_ENDPOINTS } from '../../../lib/config';

interface DangerousGoods {
  id: string;
  unNumber: string;
  properShippingName: string;
  technicalName?: string;
  class: string;
  subsidiaryRisk?: string;
  packingGroup: string;
  labels?: string;
  specialProvisions?: string;
  limitedQuantity?: string;
  exceptedQuantity?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  identifiers: DangerousGoodsIdentifier[];
}

interface DangerousGoodsIdentifier {
  id: string;
  scheme: string;
  code: string;
  extraJson?: string;
}

interface DangerousGoodsStatistics {
  totalDangerousGoods: number;
  uniqueClasses: number;
  totalIdentifiers: number;
  thisMonthDangerousGoods: number;
}

export default function DangerousGoodsPage() {
  const [dangerousGoods, setDangerousGoods] = useState<DangerousGoods[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<DangerousGoodsStatistics | null>(null);
  
  // Search ve filter state'leri
  const [searchQuery, setSearchQuery] = useState('');
  const [unNumberFilter, setUnNumberFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [schemeFilter, setSchemeFilter] = useState('');
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
      const response = await fetch(API_ENDPOINTS.DANGEROUS_GOODS_STATISTICS);
      
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (err) {
      console.error('Statistics yüklenemedi:', err);
    }
  };

  // Dangerous Goods yükle
  const fetchDangerousGoods = async (resetPage: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (unNumberFilter) params.append('unNumber', unNumberFilter);
      if (classFilter) params.append('dgClass', classFilter);
      if (schemeFilter) params.append('scheme', schemeFilter);
      params.append('take', take.toString());
      params.append('page', currentPage.toString());
      
      const response = await fetch(`${API_ENDPOINTS.DANGEROUS_GOODS}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug için
      console.log('Current Page:', currentPage); // Debug için
      setDangerousGoods(data.dangerousGoods);
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
    fetchDangerousGoods(true);
    fetchStatistics();
  }, [unNumberFilter, classFilter, schemeFilter, take]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDangerousGoods(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, unNumberFilter, classFilter, schemeFilter, take]);

  // currentPage değişikliklerinde veri yükle
  useEffect(() => {
    if (currentPage > 1) { // İlk yüklemede çalışmasın
      fetchDangerousGoods(false);
    }
  }, [currentPage]);

  // Filter'ları temizle
  const clearFilters = () => {
    setSearchQuery('');
    setUnNumberFilter('');
    setClassFilter('');
    setSchemeFilter('');
    setTake(50);
    setCurrentPage(1);
    fetchDangerousGoods(true);
  };

  // Class enum'larını göster
  const getClassDisplayName = (dgClass: string) => {
    const classNames: Record<string, string> = {
      'Class1': 'Class 1 - Explosives',
      'Class2': 'Class 2 - Gases',
      'Class3': 'Class 3 - Flammable Liquids',
      'Class4': 'Class 4 - Flammable Solids',
      'Class5': 'Class 5 - Oxidizing Substances',
      'Class6': 'Class 6 - Toxic & Infectious',
      'Class7': 'Class 7 - Radioactive',
      'Class8': 'Class 8 - Corrosives',
      'Class9': 'Class 9 - Miscellaneous'
    };
    return classNames[dgClass] || dgClass;
  };

  // Packing Group enum'larını göster
  const getPackingGroupDisplayName = (packingGroup: string) => {
    const groupNames: Record<string, string> = {
      'I': 'Packing Group I (High Danger)',
      'II': 'Packing Group II (Medium Danger)',
      'III': 'Packing Group III (Low Danger)'
    };
    return groupNames[packingGroup] || packingGroup;
  };

  // Scheme enum'larını göster
  const getSchemeDisplayName = (scheme: string) => {
    const schemeNames: Record<string, string> = {
      'UN': 'UN Number',
      'IATA': 'IATA DGR',
      'IMDG': 'IMDG Code',
      'ADR': 'ADR Agreement',
      'RID': 'RID Regulations',
      'ICAO': 'ICAO Standards',
      'Custom': 'Custom'
    };
    return schemeNames[scheme] || scheme;
  };

  // Class icon'u
  const getClassIcon = (dgClass: string) => {
    switch (dgClass) {
      case 'Class1': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Class2': return <Flame className="w-4 h-4 text-orange-600" />;
      case 'Class3': return <Droplets className="w-4 h-4 text-yellow-600" />;
      case 'Class4': return <Zap className="w-4 h-4 text-blue-600" />;
      case 'Class5': return <Hash className="w-4 h-4 text-purple-600" />;
      case 'Class6': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Class7': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Class8': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Class9': return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading && dangerousGoods.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dangerous Goods</h1>
        <p className="text-gray-600">
          Sistemde kayıtlı tüm tehlikeli malları görüntüleyin ve yönetin.
        </p>
      </div>

      {/* Statistics Widget */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total DG Items</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.totalDangerousGoods || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Hash className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.uniqueClasses || 0}
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics?.thisMonthDangerousGoods || 0}
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
              placeholder="Proper shipping name veya technical name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* UN Number Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Hash className="inline w-4 h-4 mr-1" />
              UN Number
            </label>
            <input
              type="text"
              placeholder="UN1234"
              value={unNumberFilter}
              onChange={(e) => setUnNumberFilter(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <AlertTriangle className="inline w-4 h-4 mr-1" />
              Class
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              <option value="Class1">Class 1 - Explosives</option>
              <option value="Class2">Class 2 - Gases</option>
              <option value="Class3">Class 3 - Flammable Liquids</option>
              <option value="Class4">Class 4 - Flammable Solids</option>
              <option value="Class5">Class 5 - Oxidizing Substances</option>
              <option value="Class6">Class 6 - Toxic & Infectious</option>
              <option value="Class7">Class 7 - Radioactive</option>
              <option value="Class8">Class 8 - Corrosives</option>
              <option value="Class9">Class 9 - Miscellaneous</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            {totalCount} tehlikeli mal bulundu (Sayfa {currentPage} / {totalPages})
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

      {/* Dangerous Goods Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {dangerousGoods.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No dangerous goods found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || unNumberFilter || classFilter 
                ? 'Try adjusting your search criteria.' 
                : 'Get started by importing some dangerous goods.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UN Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proper Shipping Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packing Group
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
                {dangerousGoods.map((dg) => (
                  <tr key={dg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {dg.unNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {dg.properShippingName}
                        </div>
                        {dg.technicalName && dg.technicalName !== dg.properShippingName && (
                          <div className="text-sm text-gray-500">
                            {dg.technicalName}
                          </div>
                        )}
                        {dg.subsidiaryRisk && (
                          <div className="text-xs text-gray-400">
                            Subsidiary: {dg.subsidiaryRisk}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getClassIcon(dg.class)}
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {getClassDisplayName(dg.class)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getPackingGroupDisplayName(dg.packingGroup)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {dg.identifiers.map((identifier) => (
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
                        dg.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {dg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(dg.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/super/dangerous-goods/${dg.id}`}>
                        <button className="text-red-600 hover:text-red-900 flex items-center">
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
                        ? 'bg-red-600 text-white border border-red-600'
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
