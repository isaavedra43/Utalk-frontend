import React from 'react';

export const CopilotPanel: React.FC = () => {
  // TEMPORALMENTE DESHABILITADO PARA EVITAR ERROR REACT #185
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="text-gray-500 mb-2">🔄</div>
        <p className="text-sm text-gray-600">Panel de Copiloto en mantenimiento</p>
        <p className="text-xs text-gray-400 mt-1">Se solucionará pronto</p>
      </div>
    </div>
  );
}; 