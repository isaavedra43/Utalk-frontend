'use client';

import React from 'react';

interface CreateCollectionModalProps {
  onClose: () => void;
  onCreate: (collection: any) => void;
}

export function CreateCollectionModal({ onClose, onCreate }: CreateCollectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Crear Nueva Colección
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Modal para crear colecciones en desarrollo...
          </p>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
