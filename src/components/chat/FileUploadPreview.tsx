import React from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

interface FileUploadPreviewProps {
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
  }>;
  onRemove: (id: string) => void;
}

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('audio/')) return '🎵';
    if (type.startsWith('video/')) return '🎬';
    return '📎';
  };

  return (
    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded border">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-lg">{getFileIcon(file.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {file.status === 'uploading' && (
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-blue-500 animate-pulse" />
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{file.progress}%</span>
                </div>
              )}
              
              {file.status === 'success' && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              
              {file.status === 'error' && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-500">{file.error}</span>
                </div>
              )}
              
              <button
                onClick={() => onRemove(file.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Eliminar archivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 