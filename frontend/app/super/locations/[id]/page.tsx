'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Globe, Hash, Calendar, Edit, Trash2, Plus } from 'lucide-react';
import { API_ENDPOINTS } from '../../../../lib/config';

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

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.id as string;
  
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lokasyon detayını yükle
  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.LOCATION_DETAIL(locationId));
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Location not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLocation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      fetchLocation();
    }
  }, [locationId]);

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

  // Extra JSON'ı parse et
  const parseExtraJson = (extraJson?: string) => {
    if (!extraJson) return null;
    try {
      return JSON.parse(extraJson);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Locations
          </button>
        </div>
        
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
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
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">Location not found</p>
        </div>
      </div>
    );
  }

  const extraData = parseExtraJson(location.identifiers.find(i => i.scheme === 'UNLOCODE')?.extraJson);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Locations
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{location.name}</h1>
            {location.nameAscii && location.nameAscii !== location.name && (
              <p className="text-lg text-gray-600">{location.nameAscii}</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 flex items-center">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-sm text-gray-900">{location.name}</p>
              </div>
              
              {location.nameAscii && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (ASCII)</label>
                  <p className="text-sm text-gray-900">{location.nameAscii}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {location.countryISO2}
                  </span>
                </div>
              </div>
              
              {location.subdivision && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subdivision</label>
                  <p className="text-sm text-gray-900">{location.subdivision}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {getKindDisplayName(location.kind)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  location.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {location.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(location.createdAt).toLocaleDateString()} {new Date(location.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Identifiers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Hash className="w-5 h-5 mr-2 text-blue-600" />
                Identifiers
              </h2>
              <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Add Identifier
              </button>
            </div>
            
            {location.identifiers.length === 0 ? (
              <p className="text-sm text-gray-500">No identifiers found</p>
            ) : (
              <div className="space-y-3">
                {location.identifiers.map((identifier) => (
                  <div key={identifier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getSchemeDisplayName(identifier.scheme)}
                      </span>
                      <span className="text-sm font-mono text-gray-900">{identifier.code}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* UN-LOCODE Extra Data */}
          {extraData && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">UN-LOCODE Details</h2>
              
              <div className="space-y-3">
                {extraData.Function && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Function</label>
                    <p className="text-sm text-gray-900 font-mono">{extraData.Function}</p>
                  </div>
                )}
                
                {extraData.Status && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <p className="text-sm text-gray-900">{extraData.Status}</p>
                  </div>
                )}
                
                {extraData.Date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-sm text-gray-900">{extraData.Date}</p>
                  </div>
                )}
                
                {extraData.IATA && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IATA Code</label>
                    <p className="text-sm text-gray-900 font-mono">{extraData.IATA}</p>
                  </div>
                )}
                
                {extraData.Coordinates && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates</label>
                    <p className="text-sm text-gray-900 font-mono">{extraData.Coordinates}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100">
                Export Data
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100">
                Duplicate Location
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100">
                View on Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
