'use client';

import React from 'react';

export function SearchModal() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Búsqueda Avanzada
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Modal de búsqueda avanzada en desarrollo...
          </p>
        </div>
      </div>
    </div>
  );
}
