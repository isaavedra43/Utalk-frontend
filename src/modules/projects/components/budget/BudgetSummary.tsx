// Resumen de presupuesto

import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface BudgetSummaryProps {
  total: number;
  spent: number;
  committed: number;
  remaining: number;
  currency?: string;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  total,
  spent,
  committed,
  remaining,
  currency = 'MXN',
}) => {
  const percentageSpent = total > 0 ? (spent / total) * 100 : 0;
  const percentageCommitted = total > 0 ? ((spent + committed) / total) * 100 : 0;
  const isOverBudget = (spent + committed) > total;
  const isNearLimit = percentageCommitted >= 90 && !isOverBudget;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Resumen Presupuestario</h3>
        {isOverBudget ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Sobre presupuesto</span>
          </div>
        ) : isNearLimit ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Cerca del límite</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>En presupuesto</span>
          </div>
        )}
      </div>

      {/* Presupuesto total */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Presupuesto Total</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
        </div>
        
        {/* Barra de progreso */}
        <div className="relative w-full h-6 bg-gray-200 rounded-lg overflow-hidden">
          <div
            className="absolute h-full bg-blue-500 transition-all"
            style={{ width: `${Math.min(100, percentageSpent)}%` }}
          />
          <div
            className="absolute h-full bg-yellow-500 opacity-50 transition-all"
            style={{ 
              left: `${Math.min(100, percentageSpent)}%`,
              width: `${Math.min(100 - percentageSpent, percentageCommitted - percentageSpent)}%` 
            }}
          />
          {isOverBudget && (
            <div
              className="absolute h-full bg-red-500 transition-all"
              style={{ width: `${Math.min(100, percentageCommitted - 100)}%` }}
            />
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Gastado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Comprometido</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
          </div>
          <span className="text-gray-500">{percentageCommitted.toFixed(1)}%</span>
        </div>
      </div>

      {/* Detalle */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingDown className="w-3.5 h-3.5 text-blue-500" />
            <span>Gastado</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(spent)}</p>
          <p className="text-xs text-gray-500">{percentageSpent.toFixed(1)}%</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp className="w-3.5 h-3.5 text-yellow-500" />
            <span>Comprometido</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(committed)}</p>
          <p className="text-xs text-gray-500">{((committed / total) * 100).toFixed(1)}%</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <DollarSign className="w-3.5 h-3.5 text-green-500" />
            <span>Disponible</span>
          </div>
          <p className={`text-lg font-semibold ${remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(Math.max(0, remaining))}
          </p>
          <p className="text-xs text-gray-500">{((remaining / total) * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

