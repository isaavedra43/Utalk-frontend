import React, { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  Calendar,
  User,
  Info,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Clock,
  TrendingUp
} from 'lucide-react';
import { vacationsService } from '../../../services/vacationsService';
import type { VacationPaymentCalculation, VacationPayment } from '../../../services/vacationsService';

interface VacationPaymentCalculatorProps {
  employeeId: string;
  employeeName: string;
  vacationDays: number;
  onPaymentCalculated?: (calculation: VacationPaymentCalculation) => void;
  onPaymentProcessed?: (payment: VacationPayment) => void;
}

const VacationPaymentCalculator: React.FC<VacationPaymentCalculatorProps> = ({
  employeeId,
  employeeName,
  vacationDays,
  onPaymentCalculated,
  onPaymentProcessed
}) => {
  const [calculation, setCalculation] = useState<VacationPaymentCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Calcular pago automáticamente cuando cambien los días
  useEffect(() => {
    if (vacationDays > 0) {
      calculatePayment();
    }
  }, [employeeId, vacationDays]);

  const calculatePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Por ahora, usar cálculo local hasta que el backend esté implementado
      const dailySalary = 500; // Salario diario por defecto
      const vacationAmount = dailySalary * vacationDays;
      const primaVacacional = vacationAmount * 0.25; // 25% según LFT
      const totalAmount = vacationAmount + primaVacacional;

      const mockCalculation: VacationPaymentCalculation = {
        employeeId,
        employeeName: 'Empleado',
        dailySalary,
        vacationDays,
        vacationAmount,
        primaVacacional,
        totalAmount,
        breakdown: {
          baseSalary: vacationAmount,
          primaVacacional,
          total: totalAmount
        },
        legalBasis: {
          law: 'Ley Federal del Trabajo',
          article: 'Artículo 80',
          percentage: 25
        }
      };
      
      setCalculation(mockCalculation);
      onPaymentCalculated?.(mockCalculation);
      
      // TODO: Implementar cuando el backend esté listo
      // const result = await vacationsService.calculateVacationPayment(
      //   employeeId,
      //   vacationDays
      // );
      // 
      // setCalculation(result);
      // onPaymentCalculated?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error calculando pago');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (paymentMethod: 'cash' | 'bank_transfer' | 'payroll') => {
    if (!calculation) return;
    
    setLoading(true);
    try {
      // TODO: Implementar cuando el backend esté listo
      console.log('Procesando pago:', { paymentMethod, calculation });
      alert('Funcionalidad de procesamiento de pagos estará disponible próximamente');
      
      // const payment = await vacationsService.processVacationPayment({
      //   employeeId,
      //   vacationRequestId: '', // Se asignará cuando se apruebe la solicitud
      //   days: vacationDays,
      //   dailySalary: calculation.dailySalary,
      //   paymentMethod
      // });
      // 
      // onPaymentProcessed?.(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error procesando pago');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading && !calculation) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-blue-700 font-medium">Calculando pago de vacaciones...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700 font-medium">Error</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={calculatePayment}
          className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Calculadora de Pagos</span>
        </div>
        <p className="text-gray-600 text-sm mt-1">
          Selecciona los días de vacaciones para calcular el pago
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calculator className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Cálculo de Pago de Vacaciones</h3>
            <p className="text-sm text-gray-500">{employeeName}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
        </button>
      </div>

      {/* Resumen Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Días de Vacaciones</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{vacationDays}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">Salario por Vacaciones</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(calculation.vacationAmount)}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Total a Pagar</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(calculation.totalAmount)}
          </p>
        </div>
      </div>

      {/* Detalles Expandibles */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Desglose de Pagos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Desglose de Pagos</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Salario diario:</span>
                <span className="font-medium">{formatCurrency(calculation.dailySalary)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Días de vacaciones:</span>
                <span className="font-medium">{vacationDays} días</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                <span className="text-gray-600">Salario por vacaciones:</span>
                <span className="font-medium">{formatCurrency(calculation.vacationAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prima vacacional (25%):</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(calculation.primaVacacional)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-2 font-semibold">
                <span className="text-gray-900">Total a pagar:</span>
                <span className="text-green-600 text-lg">
                  {formatCurrency(calculation.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Base Legal */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Base Legal</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ley:</span>
                <span className="font-medium">{calculation.legalBasis.law}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Artículo:</span>
                <span className="font-medium">{calculation.legalBasis.article}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Porcentaje prima vacacional:</span>
                <span className="font-medium">{calculation.legalBasis.percentage}%</span>
              </div>
            </div>
          </div>

          {/* Opciones de Pago */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Opciones de Pago</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleProcessPayment('cash')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Efectivo</span>
              </button>
              
              <button
                onClick={() => handleProcessPayment('bank_transfer')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Transferencia</span>
              </button>
              
              <button
                onClick={() => handleProcessPayment('payroll')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Nómina</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información Adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-800 font-medium">Información Importante</p>
            <p className="text-yellow-700 mt-1">
              Este cálculo incluye la prima vacacional del 25% según la Ley Federal del Trabajo. 
              El pago se procesará una vez que la solicitud sea aprobada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationPaymentCalculator;
