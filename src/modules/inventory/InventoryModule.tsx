import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Componente principal del módulo de inventario
const InventoryMainView: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Inventario
            </h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Gestión integral del inventario de la empresa
            </p>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-blue-100 mb-6">
                <svg 
                  className="h-12 w-12 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Próximamente
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                El módulo de inventario estará disponible pronto. Aquí podrás gestionar todo el inventario de la empresa de manera integral.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal del módulo de inventario
const InventoryModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<InventoryMainView />} />
      <Route path="*" element={<InventoryMainView />} />
    </Routes>
  );
};

export default InventoryModule;
