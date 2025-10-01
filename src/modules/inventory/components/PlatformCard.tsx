import React from 'react';
import { Calendar, Package, Layers, ChevronRight } from 'lucide-react';
import type { Platform } from '../types';
import { formatNumber } from '../utils/calculations';

interface PlatformCardProps {
  platform: Platform;
  onClick: () => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({ platform, onClick }) => {
  const statusColors = {
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    exported: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const statusLabels = {
    in_progress: 'En Proceso',
    completed: 'Completada',
    exported: 'Exportada'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 overflow-hidden hover:border-blue-400 group active:scale-98"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white truncate flex-1 mr-2">
            Plataforma {platform.platformNumber}
          </h3>
          <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
        {/* Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium border ${statusColors[platform.status]} truncate`}>
            {statusLabels[platform.status]}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {new Date(platform.receptionDate).toLocaleDateString('es-MX', { 
              day: '2-digit',
              month: 'short'
            })}
          </span>
        </div>

        {/* Material Type */}
        <div className="flex items-center gap-2 text-gray-700 min-w-0">
          <Layers className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{platform.materialType}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-gray-100">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-1 truncate">Total Piezas</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1">
              <Package className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">{platform.pieces.length}</span>
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-1 truncate">Metros Lineales</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {formatNumber(platform.totalLinearMeters, 2)}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">
            Ancho estándar: <span className="font-medium text-gray-700">{formatNumber(platform.standardWidth, 2)} m</span>
          </p>
        </div>
      </div>

      {/* Footer Hover Effect */}
      <div className="bg-gray-50 px-3 sm:px-4 py-2 text-center border-t border-gray-100 group-hover:bg-blue-50 transition-colors">
        <p className="text-xs text-gray-600 group-hover:text-blue-600 font-medium">
          Clic para ver detalles →
        </p>
      </div>
    </div>
  );
};

