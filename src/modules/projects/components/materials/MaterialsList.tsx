// Lista de materiales del proyecto

import React from 'react';
import type { ProjectMaterial } from '../../types';
import { Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface MaterialsListProps {
  materials: ProjectMaterial[];
  onMaterialClick?: (material: ProjectMaterial) => void;
}

export const MaterialsList: React.FC<MaterialsListProps> = ({
  materials,
  onMaterialClick,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ordered':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'depleted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">No hay materiales registrados</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Agregar Material
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Materiales del Proyecto</h3>
          <span className="text-sm text-gray-600">{materials.length} materiales</span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {materials.map((material) => {
          const utilizationPercent = material.quantityPlanned > 0
            ? (material.quantityUsed / material.quantityPlanned) * 100
            : 0;
          const isLowStock = material.quantityRemaining < material.minStock;
          const costVariance = material.actualCost - material.budgetedCost;

          return (
            <div
              key={material.id}
              onClick={() => onMaterialClick?.(material)}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                {/* Info del material */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">{material.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(material.status)}`}>
                      {material.status.replace('_', ' ')}
                    </span>
                    {isLowStock && material.status !== 'depleted' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full border border-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        Stock bajo
                      </span>
                    )}
                  </div>
                  
                  {material.specification && (
                    <p className="text-xs text-gray-600 mb-2">{material.specification}</p>
                  )}
                  
                  {/* Cantidades */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-500">Planificado:</span>
                      <span className="ml-1 font-medium">{material.quantityPlanned} {material.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Usado:</span>
                      <span className="ml-1 font-medium">{material.quantityUsed} {material.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Restante:</span>
                      <span className="ml-1 font-medium">{material.quantityRemaining} {material.unit}</span>
                    </div>
                  </div>
                  
                  {/* Barra de utilización */}
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          utilizationPercent >= 100 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, utilizationPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Costos */}
                <div className="flex-shrink-0 ml-4 text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(material.actualCost)}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Presupuestado: {formatCurrency(material.budgetedCost)}
                  </p>
                  
                  {costVariance !== 0 && (
                    <div className={`flex items-center justify-end gap-1 text-xs ${
                      costVariance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {costVariance > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{formatCurrency(Math.abs(costVariance))}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ubicaciones de almacenamiento */}
              {material.storage && material.storage.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {material.storage.map((storage, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full border border-purple-200"
                    >
                      {storage.location} - {storage.zone}: {storage.quantity} {material.unit}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

