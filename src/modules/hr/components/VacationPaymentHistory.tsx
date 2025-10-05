import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  FileText,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { vacationsService } from '../../../services/vacationsService';
import type { VacationPayment, VacationPaymentSummary } from '../../../services/vacationsService';

interface VacationPaymentHistoryProps {
  employeeId: string;
  employeeName: string;
  onPaymentUpdated?: () => void;
}

const VacationPaymentHistory: React.FC<VacationPaymentHistoryProps> = ({
  employeeId,
  employeeName,
  onPaymentUpdated
}) => {
  const [payments, setPayments] = useState<VacationPayment[]>([]);
  const [summary, setSummary] = useState<VacationPaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentData();
  }, [employeeId]);

  const loadPaymentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Por ahora, usar datos mock hasta que el backend esté implementado
      const mockPayments: VacationPayment[] = [];
      const mockSummary: VacationPaymentSummary = {
        totalPaid: 0,
        totalPending: 0,
        totalOwed: 0,
        paymentsCount: 0,
        pendingCount: 0
      };
      
      setPayments(mockPayments);
      setSummary(mockSummary);
      
      // TODO: Implementar cuando el backend esté listo
      // const [paymentsData, summaryData] = await Promise.all([
      //   vacationsService.getVacationPayments(employeeId),
      //   vacationsService.getVacationPaymentSummary(employeeId)
      // ]);
      // 
      // setPayments(paymentsData);
      // setSummary(summaryData);
    } catch (err) {
      console.error('Error cargando datos de pagos:', err);
      setError('Los pagos de vacaciones estarán disponibles próximamente');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      // TODO: Implementar cuando el backend esté listo
      console.log('Marcando pago como realizado:', paymentId);
      alert('Funcionalidad de pagos estará disponible próximamente');
      
      // await vacationsService.markPaymentAsPaid(
      //   paymentId,
      //   `Pago realizado - ${new Date().toLocaleDateString()}`,
      //   'cash'
      // );
      // 
      // loadPaymentData();
      // onPaymentUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marcando pago');
    }
  };

  const handleCancelPayment = async (paymentId: string) => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;
    
    try {
      // TODO: Implementar cuando el backend esté listo
      console.log('Cancelando pago:', paymentId, reason);
      alert('Funcionalidad de pagos estará disponible próximamente');
      
      // await vacationsService.cancelPayment(paymentId, reason);
      // 
      // loadPaymentData();
      // onPaymentUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cancelando pago');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Cargando historial de pagos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar pagos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPaymentData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Historial de Pagos de Vacaciones</h2>
            <p className="text-sm text-gray-500">{employeeName}</p>
          </div>
        </div>
        <button
          onClick={loadPaymentData}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm">Actualizar</span>
        </button>
      </div>

      {/* Resumen */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Total Pagado</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalPaid)}
            </p>
            <p className="text-xs text-green-700 mt-1">
              {summary.paymentsCount} pagos realizados
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">Pendiente</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.totalPending)}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              {summary.pendingCount} pagos pendientes
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Adeudado</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalOwed)}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Incluye pendientes
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Último Pago</span>
            </div>
            <p className="text-sm font-bold text-purple-600">
              {summary.lastPaymentDate ? formatDate(summary.lastPaymentDate) : 'N/A'}
            </p>
            <p className="text-xs text-purple-700 mt-1">
              {summary.nextPaymentDue && `Próximo: ${formatDate(summary.nextPaymentDue)}`}
            </p>
          </div>
        </div>
      )}

      {/* Lista de Pagos */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Historial de Pagos</h3>
        </div>
        
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos registrados</h3>
            <p className="text-gray-500">
              Los pagos de vacaciones aparecerán aquí una vez que sean procesados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(payment.paymentDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{payment.days} días</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{formatCurrency(payment.totalAmount)}</div>
                        <div className="text-gray-500">
                          Prima: {formatCurrency(payment.primaVacacional)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleMarkAsPaid(payment.id)}
                              className="text-green-600 hover:text-green-900 text-sm"
                            >
                              Marcar como pagado
                            </button>
                            <button
                              onClick={() => handleCancelPayment(payment.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Cancelar
                            </button>
                          </>
                        )}
                        {payment.paymentReference && (
                          <span className="text-gray-500 text-xs">
                            Ref: {payment.paymentReference}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VacationPaymentHistory;
