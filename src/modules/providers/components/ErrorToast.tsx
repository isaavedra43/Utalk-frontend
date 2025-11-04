import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { ErrorInfo } from '../hooks/useErrorHandler';

interface ErrorToastProps {
  error: ErrorInfo | null;
  onClose: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-md flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
          {error.code && (
            <p className="text-xs text-red-500 mt-1">Código: {error.code}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
