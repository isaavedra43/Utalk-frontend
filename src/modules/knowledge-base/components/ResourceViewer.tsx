'use client';

import React from 'react';

interface ResourceViewerProps {
  resource?: any;
  onClose: () => void;
}

export function ResourceViewer({ resource, onClose }: ResourceViewerProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Visor de Recursos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sistema completo de visualización de recursos en desarrollo...
        </p>
      </div>
    </div>
  );
}
