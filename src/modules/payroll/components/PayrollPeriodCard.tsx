// ===================================================================
// COMPONENTE DE TARJETA PARA PERÍODO DE NÓMINA
// ===================================================================

import React from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  CreditCard,
  Play,
  Check,
  ChevronRight,
  MoreVertical
} from 'lucide-react';

import { PayrollPeriod } from '../../../types/payroll';
import { 
  formatCurrency, 
  formatDateRange, 
  getPeriodStatusLabel, 
  getPeriodStatusColor,
  getPeriodProgress,
  canPeriodBeProcessed,
  canPeriodBeApproved,
  canPeriodBePaid
} from '../../../utils/payrollUtils';

interface PayrollPeriodCardProps {
  period: PayrollPeriod;
  isSelected: boolean;
  onSelect: () => void;
  onProcess: () => void;
  onApprove: () => void;
  onMarkAsPaid: () => void;
}

const PayrollPeriodCard: React.FC<PayrollPeriodCardProps> = ({
  period,
  isSelected,
  onSelect,
  onProcess,
  onApprove,
  onMarkAsPaid
}) => {
  const progress = getPeriodProgress(period);
  const statusColor = getPeriodStatusColor(period.status);

  const getStatusIcon = () => {
    switch (period.status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'calculated':
        return <CheckCircle className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'paid':
        return <CreditCard className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {period.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            <Calendar className="w-3 h-3 inline mr-1" />
            {formatDateRange(period.startDate, period.endDate)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Estado */}
          <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
            {getStatusIcon()}
            <span className="ml-1">{getPeriodStatusLabel(period.status)}</span>
          </div>
          
          {/* Menú de acciones */}
          <div className="relative">
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center text-blue-600 mb-1">
            <Users className="w-4 h-4 mr-1" />
          </div>
          <p className="text-xs text-gray-500">Empleados</p>
          <p className="text-sm font-semibold text-gray-900">
            {period.summary.totalEmployees}
          </p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center text-green-600 mb-1">
            <DollarSign className="w-4 h-4 mr-1" />
          </div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(period.summary.totalPayroll)}
          </p>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progreso</span>
          <span>{progress.percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 bg-${progress.color}-500`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{progress.label}</p>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {/* Botón Procesar */}
          {canPeriodBeProcessed(period) && (
            <button
              onClick={(e) => handleActionClick(e, onProcess)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
            >
              <Play className="w-3 h-3 mr-1" />
              Procesar
            </button>
          )}

          {/* Botón Aprobar */}
          {canPeriodBeApproved(period) && (
            <button
              onClick={(e) => handleActionClick(e, onApprove)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
            >
              <Check className="w-3 h-3 mr-1" />
              Aprobar
            </button>
          )}

          {/* Botón Marcar como Pagado */}
          {canPeriodBePaid(period) && (
            <button
              onClick={(e) => handleActionClick(e, onMarkAsPaid)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
            >
              <CreditCard className="w-3 h-3 mr-1" />
              Pagado
            </button>
          )}
        </div>

        {/* Indicador de Selección */}
        {isSelected && (
          <ChevronRight className="w-4 h-4 text-blue-500" />
        )}
      </div>

      {/* Detalles Adicionales (solo si está seleccionado) */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <p className="text-gray-500">Procesados</p>
              <p className="font-semibold text-blue-600">
                {period.summary.employeesProcessed}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Aprobados</p>
              <p className="font-semibold text-green-600">
                {period.summary.employeesApproved}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Pagados</p>
              <p className="font-semibold text-purple-600">
                {period.summary.employeesPaid}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPeriodCard;
