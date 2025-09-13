// ===================================================================
// COMPONENTE DE ESTADÍSTICAS DEL PERÍODO DE NÓMINA
// ===================================================================

import React from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  CheckCircle,
  CreditCard,
  Clock
} from 'lucide-react';

import { PayrollPeriod } from '../../../types/payroll';
import { formatCurrency } from '../../../utils/payrollUtils';

interface PayrollStatsProps {
  period: PayrollPeriod;
}

const PayrollStats: React.FC<PayrollStatsProps> = ({ period }) => {
  const { summary } = period;

  // Calcular porcentajes
  const processedPercentage = summary.totalEmployees > 0 
    ? (summary.employeesProcessed / summary.totalEmployees) * 100 
    : 0;

  const approvedPercentage = summary.totalEmployees > 0 
    ? (summary.employeesApproved / summary.totalEmployees) * 100 
    : 0;

  const paidPercentage = summary.totalEmployees > 0 
    ? (summary.employeesPaid / summary.totalEmployees) * 100 
    : 0;

  return (
    <div className="p-6">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Empleados */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</h3>
          <p className="text-sm text-gray-600">Total Empleados</p>
        </div>

        {/* Nómina Total */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-3">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalPayroll)}</h3>
          <p className="text-sm text-gray-600">Nómina Total</p>
        </div>

        {/* Salario Promedio */}
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-full mb-3">
            <Calculator className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(summary.averageSalary)}</h3>
          <p className="text-sm text-gray-600">Salario Promedio</p>
        </div>
      </div>

      {/* Percepciones y Deducciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Total Percepciones</span>
            </div>
            <span className="text-lg font-bold text-green-900">
              {formatCurrency(summary.totalPerceptions)}
            </span>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Total Deducciones</span>
            </div>
            <span className="text-lg font-bold text-red-900">
              {formatCurrency(summary.totalDeductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Estados de Empleados */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Estado de Procesamiento</h4>
        
        <div className="space-y-4">
          {/* Procesados */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-sm text-gray-700">Procesados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processedPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                {summary.employeesProcessed} ({processedPercentage.toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Aprobados */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm text-gray-700">Aprobados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${approvedPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                {summary.employeesApproved} ({approvedPercentage.toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Pagados */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-sm text-gray-700">Pagados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${paidPercentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                {summary.employeesPaid} ({paidPercentage.toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Pendientes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-600 mr-3" />
              <span className="text-sm text-gray-700">Pendientes</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                <div 
                  className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${summary.totalEmployees > 0 ? 
                      ((summary.employeesPending / summary.totalEmployees) * 100) : 0}%` 
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                {summary.employeesPending} ({summary.totalEmployees > 0 ? 
                  (((summary.employeesPending / summary.totalEmployees) * 100).toFixed(0)) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      {(period.processedAt || period.approvedAt || period.paidAt) && (
        <div className="border-t pt-6 mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Historial</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {period.processedAt && (
              <div className="flex justify-between">
                <span>Procesado:</span>
                <span>{new Date(period.processedAt).toLocaleString('es-MX')}</span>
              </div>
            )}
            {period.approvedAt && (
              <div className="flex justify-between">
                <span>Aprobado:</span>
                <span>{new Date(period.approvedAt).toLocaleString('es-MX')}</span>
              </div>
            )}
            {period.paidAt && (
              <div className="flex justify-between">
                <span>Pagado:</span>
                <span>{new Date(period.paidAt).toLocaleString('es-MX')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollStats;
