'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../../lib/config';

interface ImportResult {
  totalRows: number;
  locationsInserted: number;
  identifiersInserted: number;
  locationsUpdated: number;
  skipped: number;
}

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  result: ImportResult | null;
  error: string | null;
}

export default function LocationImportPage() {
  const [fileStates, setFileStates] = useState<Record<string, FileUploadState>>({
    'unlocode': { file: null, uploading: false, result: null, error: null },
    'country-codes': { file: null, uploading: false, result: null, error: null },
    'function-classifiers': { file: null, uploading: false, result: null, error: null },
    'status-indicators': { file: null, uploading: false, result: null, error: null },
    'subdivision-codes': { file: null, uploading: false, result: null, error: null },
    'alias': { file: null, uploading: false, result: null, error: null }
  });

  const fileTypes = [
    {
      key: 'unlocode',
      name: 'UN-LOCODE Code List',
      description: 'Ana lokasyon verileri (code-list.csv)',
      endpoint: API_ENDPOINTS.LOCATION_IMPORT('unlocode')
    },
    {
      key: 'country-codes',
      name: 'Country Codes',
      description: 'Ülke kodları (country-codes.csv)',
      endpoint: API_ENDPOINTS.LOCATION_IMPORT('country-codes')
    },
    {
      key: 'function-classifiers',
      name: 'Function Classifiers',
      description: 'Fonksiyon sınıflandırıcıları (function-classifiers.csv)',
      endpoint: API_ENDPOINTS.LOCATION_IMPORT('function-classifiers')
    },
    {
      key: 'status-indicators',
      name: 'Status Indicators',
      description: 'Durum göstergeleri (status-indicators.csv)',
      endpoint: API_ENDPOINTS.LOCATION_IMPORT('status-indicators')
    },
    {
      key: 'subdivision-codes',
      name: 'Subdivision Codes',
      description: 'Alt bölüm kodları (subdivision-codes.csv)',
      endpoint: API_ENDPOINTS.LOCATION_IMPORT('subdivision-codes')
    },
    {
      key: 'alias',
      name: 'Alias',
      description: 'Takma adlar (alias.csv)',
      endpoint: API_ENDPOINTS.LOCATION_IMPORT('alias')
    }
  ];

  const handleFileSelect = (fileType: string, file: File) => {
    setFileStates(prev => ({
      ...prev,
      [fileType]: {
        ...prev[fileType],
        file,
        result: null,
        error: null
      }
    }));
  };

  const handleUpload = async (fileType: string) => {
    const state = fileStates[fileType];
    if (!state.file) return;

    setFileStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], uploading: true, error: null }
    }));

    try {
      const formData = new FormData();
      formData.append('file', state.file);

      const endpoint = fileTypes.find(ft => ft.key === fileType)?.endpoint || '';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      setFileStates(prev => ({
        ...prev,
        [fileType]: { ...prev[fileType], uploading: false, result }
      }));
    } catch (error) {
      setFileStates(prev => ({
        ...prev,
        [fileType]: { 
          ...prev[fileType], 
          uploading: false, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        }
      }));
    }
  };

  const resetFileState = (fileType: string) => {
    setFileStates(prev => ({
      ...prev,
      [fileType]: { file: null, uploading: false, result: null, error: null }
    }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">UN-LOCODE Import</h1>
        <p className="text-gray-600">
          UN-LOCODE verilerini sisteme yüklemek için aşağıdaki dosya türlerini kullanabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fileTypes.map((fileType) => {
          const state = fileStates[fileType.key];
          
          return (
            <div key={fileType.key} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {fileType.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {fileType.description}
                  </p>
                </div>
                <FileText className="w-6 h-6 text-blue-500" />
              </div>

              {/* File Input */}
              <div className="mb-4">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(fileType.key, file);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* File Info */}
              {state.file && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        {state.file.name} ({(state.file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => resetFileState(fileType.key)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={() => handleUpload(fileType.key)}
                disabled={!state.file || state.uploading}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  !state.file || state.uploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {state.uploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </div>
                )}
              </button>

              {/* Results */}
              {state.result && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Upload Successful</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>Total Rows: {state.result.totalRows}</div>
                    <div>Locations Inserted: {state.result.locationsInserted}</div>
                    <div>Identifiers Inserted: {state.result.identifiersInserted}</div>
                    <div>Locations Updated: {state.result.locationsUpdated}</div>
                    <div>Skipped: {state.result.skipped}</div>
                  </div>
                </div>
              )}

              {/* Error */}
              {state.error && (
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-800">{state.error}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Instructions</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>• <strong>code-list:</strong> Ana UN-LOCODE verileri (en büyük dosya, ~7.4 MB)</p>
          <p>• <strong>country-codes:</strong> Ülke kodları ve isimleri</p>
          <p>• <strong>function-classifiers:</strong> Fonksiyon türleri (Port, Rail, Road, Airport)</p>
          <p>• <strong>status-indicators:</strong> Lokasyon durumları (Approved, Pending, etc.)</p>
          <p>• <strong>subdivision-codes:</strong> Alt bölüm kodları (TR-35, US-CA, etc.)</p>
          <p>• <strong>alias:</strong> Lokasyon takma adları</p>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Not:</strong> Dosyalar CSV formatında olmalıdır. İlk satır başlık satırı olarak kabul edilir.
          </p>
        </div>
      </div>
    </div>
  );
}
