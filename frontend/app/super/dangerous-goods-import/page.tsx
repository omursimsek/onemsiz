'use client';

import { useState } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react';
import { API_ENDPOINTS } from '../../../lib/config';

interface ImportResult {
  totalRows: number;
  dangerousGoodsInserted: number;
  identifiersInserted: number;
  dangerousGoodsUpdated: number;
  skipped: number;
}

interface FileState {
  file: File | null;
  uploading: boolean;
  result: ImportResult | null;
  error: string | null;
}

const fileTypes = [
  {
    key: 'un-numbers',
    label: 'UN Numbers List',
    description: 'UN numbers ve proper shipping names',
    endpoint: API_ENDPOINTS.DANGEROUS_GOODS_IMPORT('un-numbers'),
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    key: 'iata-dgr',
    label: 'IATA DGR Data',
    description: 'IATA Dangerous Goods Regulations',
    endpoint: API_ENDPOINTS.DANGEROUS_GOODS_IMPORT('iata-dgr'),
    icon: <FileText className="w-5 h-5" />
  },
  {
    key: 'imdg-code',
    label: 'IMDG Code Data',
    description: 'International Maritime Dangerous Goods',
    endpoint: API_ENDPOINTS.DANGEROUS_GOODS_IMPORT('imdg-code'),
    icon: <FileText className="w-5 h-5" />
  },
  {
    key: 'adr-agreement',
    label: 'ADR Agreement Data',
    description: 'European Agreement for Road Transport',
    endpoint: API_ENDPOINTS.DANGEROUS_GOODS_IMPORT('adr-agreement'),
    icon: <FileText className="w-5 h-5" />
  },
  {
    key: 'rid-regulations',
    label: 'RID Regulations Data',
    description: 'Railway Transport Regulations',
    endpoint: API_ENDPOINTS.DANGEROUS_GOODS_IMPORT('rid-regulations'),
    icon: <FileText className="w-5 h-5" />
  }
];

export default function DangerousGoodsImportPage() {
  const [fileStates, setFileStates] = useState<Record<string, FileState>>(() => {
    const states: Record<string, FileState> = {};
    fileTypes.forEach(ft => {
      states[ft.key] = {
        file: null,
        uploading: false,
        result: null,
        error: null
      };
    });
    return states;
  });

  const handleFileSelect = (fileType: string, file: File) => {
    setFileStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], file, result: null, error: null }
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

  const clearFile = (fileType: string) => {
    setFileStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], file: null, result: null, error: null }
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dangerous Goods Import</h1>
        <p className="text-gray-600">
          Tehlikeli mallar için farklı kaynaklardan veri yükleyin. Her dosya türü için uygun format kullanın.
        </p>
      </div>

      {/* File Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fileTypes.map((fileType) => {
          const state = fileStates[fileType.key];
          
          return (
            <div key={fileType.key} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg text-red-600 mr-3">
                  {fileType.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{fileType.label}</h3>
                  <p className="text-sm text-gray-600">{fileType.description}</p>
                </div>
              </div>

              {/* File Input */}
              <div className="mb-4">
                {!state.file ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV, Excel files</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(fileType.key, file);
                      }}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{state.file.name}</span>
                    </div>
                    <button
                      onClick={() => clearFile(fileType.key)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={() => handleUpload(fileType.key)}
                disabled={!state.file || state.uploading}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !state.file || state.uploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                }`}
              >
                {state.uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </div>
                )}
              </button>

              {/* Error Display */}
              {state.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Upload Failed</span>
                  </div>
                  <p className="mt-1 text-sm text-red-700">{state.error}</p>
                </div>
              )}

              {/* Success Result */}
              {state.result && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Upload Successful</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>Total Rows: {state.result.totalRows}</div>
                    <div>Dangerous Goods Inserted: {state.result.dangerousGoodsInserted}</div>
                    <div>Identifiers Inserted: {state.result.identifiersInserted}</div>
                    <div>Dangerous Goods Updated: {state.result.dangerousGoodsUpdated}</div>
                    <div>Skipped: {state.result.skipped}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Import Instructions</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>UN Numbers List:</strong> CSV formatında UN number, proper shipping name, class, packing group bilgileri</p>
          <p><strong>IATA DGR:</strong> IATA Dangerous Goods Regulations verileri</p>
          <p><strong>IMDG Code:</strong> International Maritime Dangerous Goods verileri</p>
          <p><strong>ADR Agreement:</strong> European Agreement for Road Transport verileri</p>
          <p><strong>RID Regulations:</strong> Railway Transport Regulations verileri</p>
        </div>
        <div className="mt-4">
          <a
            href="/sample-files/dangerous-goods-template.csv"
            download
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </a>
        </div>
      </div>
    </div>
  );
}
