import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import { ProvidersService } from '../services/providersService';
import type { AccountStatement } from '../types';

interface AccountStatementSectionProps {
  providerId: string;
  providerName: string;
  onExportPDF?: () => void;
}

export const AccountStatementSection: React.FC<AccountStatementSectionProps> = ({
  providerId,
  providerName,
  onExportPDF,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30' | '60' | '90'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statementData, setStatementData] = useState<AccountStatement | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Cargar datos del backend
  useEffect(() => {
    const loadAccountStatement = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Calcular fechas según el período seleccionado
        let dateFrom: string | undefined;
        if (selectedPeriod !== 'all') {
          const days = parseInt(selectedPeriod);
          const date = new Date();
          date.setDate(date.getDate() - days);
          dateFrom = date.toISOString().split('T')[0];
        }

        const data = await ProvidersService.getAccountStatement(providerId, {
          dateFrom,
          dateTo: undefined, // Hasta hoy
        });
        
        setStatementData(data);
      } catch (err) {
        console.error('Error loading account statement:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el estado de cuenta');
      } finally {
        setLoading(false);
      }
    };

    loadAccountStatement();
  }, [providerId, selectedPeriod]);

  // Si está cargando, mostrar skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estado de Cuenta</h3>
            <p className="text-sm text-gray-500 mt-1">{providerName}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Cargando estado de cuenta...</span>
        </div>
      </div>
    );
  }

  // Si hay error, mostrarlo
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estado de Cuenta</h3>
            <p className="text-sm text-gray-500 mt-1">{providerName}</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos
  if (!statementData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estado de Cuenta</h3>
            <p className="text-sm text-gray-500 mt-1">{providerName}</p>
          </div>
        </div>
        
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const currentBalance = statementData.currentBalance;
  const totalOrders = statementData.totalOrders || 0;
  const totalPayments = statementData.totalPayments || 0;

  // Crear timeline combinando órdenes y pagos
  const timelineItems = [
    ...(statementData.orders?.map(order => ({
      id: order.id,
      type: 'order' as const,
      date: order.date,
      description: `Orden de Compra #${order.orderNumber}`,
      orderAmount: order.amount,
      paymentAmount: undefined,
      balance: 0, // Se calculará después
      status: order.status,
    })) || []),
    ...(statementData.payments?.map(payment => ({
      id: payment.id,
      type: 'payment' as const,
      date: payment.date,
      description: `Pago #${payment.paymentNumber}`,
      orderAmount: undefined,
      paymentAmount: payment.amount,
      balance: 0, // Se calculará después
      status: payment.status || 'completed',
    })) || []),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calcular balance acumulado
  let runningBalance = statementData.openingBalance || 0;
  timelineItems.forEach(item => {
    if (item.type === 'order') {
      runningBalance += item.orderAmount || 0;
    } else {
      runningBalance -= item.paymentAmount || 0;
    }
    item.balance = runningBalance;
  });

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Estado de Cuenta</h3>
          <p className="text-sm text-gray-500 mt-1">{providerName}</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">Todo el tiempo</option>
            <option value="30">Últimos 30 días</option>
            <option value="60">Últimos 60 días</option>
            <option value="90">Últimos 90 días</option>
          </select>

          {onExportPDF && (
            <>
              <button
                onClick={onExportPDF}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                title="Exportar PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards - Super Simple */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Opening Balance */}
        {statementData.openingBalance !== undefined && statementData.openingBalance !== 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-medium text-purple-900">Saldo Inicial</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(statementData.openingBalance)}</p>
          </div>
        )}

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-blue-900">Total Órdenes</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalOrders)}</p>
          <p className="text-xs text-blue-700 mt-1">{statementData.orders?.length || 0} órdenes</p>
        </div>

        {/* Total Payments */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-green-900">Total Pagos</p>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(totalPayments)}</p>
          <p className="text-xs text-green-700 mt-1">{statementData.payments?.length || 0} pagos</p>
        </div>

        {/* Current Balance */}
        <div className={`bg-gradient-to-br rounded-lg p-4 border ${
          statementData.openingBalance !== undefined && statementData.openingBalance !== 0 ? 'col-span-1' : 'col-span-1 md:col-span-2'
        } ${
          statementData.currentBalance > 0
            ? 'from-red-50 to-red-100 border-red-200'
            : statementData.currentBalance < 0
            ? 'from-yellow-50 to-yellow-100 border-yellow-200'
            : 'from-gray-50 to-gray-100 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${
              statementData.currentBalance > 0
                ? 'bg-red-600'
                : statementData.currentBalance < 0
                ? 'bg-yellow-600'
                : 'bg-gray-600'
            }`}>
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className={`text-sm font-medium ${
              statementData.currentBalance > 0
                ? 'text-red-900'
                : statementData.currentBalance < 0
                ? 'text-yellow-900'
                : 'text-gray-900'
            }`}>
              {statementData.currentBalance > 0 ? 'Saldo Pendiente' : statementData.currentBalance < 0 ? 'Saldo a Favor' : 'Sin Saldo'}
            </p>
          </div>
          <p className={`text-3xl font-bold ${
            statementData.currentBalance > 0
              ? 'text-red-900'
              : statementData.currentBalance < 0
              ? 'text-yellow-900'
              : 'text-gray-900'
          }`}>
            {formatCurrency(Math.abs(statementData.currentBalance))}
          </p>
          <p className={`text-xs mt-1 ${
            statementData.currentBalance > 0
              ? 'text-red-700'
              : statementData.currentBalance < 0
              ? 'text-yellow-700'
              : 'text-gray-600'
          }`}>
            {statementData.currentBalance > 0
              ? '💡 Debes al proveedor'
              : statementData.currentBalance < 0
              ? '✅ El proveedor te debe'
              : '✅ Cuenta saldada'}
          </p>
        </div>
      </div>

      {/* Explanation Box - Ultra Simple */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">📊 ¿Cómo funciona el estado de cuenta?</h4>
            <p className="text-sm text-blue-800">
              <strong>Súper sencillo:</strong> Cada vez que haces una <strong className="text-blue-900">Orden de Compra</strong>, el saldo aumenta (↑ debes más). 
              Cada vez que haces un <strong className="text-blue-900">Pago</strong>, el saldo disminuye (↓ debes menos).
            </p>
            <div className="mt-2 space-y-1 text-xs text-blue-700">
              <p>• <strong>Saldo Positivo (Rojo)</strong> = Le debes al proveedor 💸</p>
              <p>• <strong>Saldo Negativo (Amarillo)</strong> = El proveedor te debe 💰</p>
              <p>• <strong>Saldo Cero (Gris)</strong> = Estás al corriente ✅</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-4">Movimientos</h4>
        
        {timelineItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No hay movimientos en este período</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div className="col-span-2">Fecha</div>
              <div className="col-span-4">Descripción</div>
              <div className="col-span-2 text-right">Órdenes (+)</div>
              <div className="col-span-2 text-right">Pagos (-)</div>
              <div className="col-span-2 text-right">Saldo</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {timelineItems.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}-${index}`}
                  className={`px-4 py-3 grid grid-cols-12 gap-4 text-sm hover:bg-gray-50 transition-colors ${
                    item.type === 'order' ? 'bg-blue-50/30' : 'bg-green-50/30'
                  }`}
                >
                  <div className="col-span-2 text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                  <div className="col-span-4 font-medium text-gray-900">
                    {item.description}
                  </div>
                  <div className="col-span-2 text-right">
                    {item.orderAmount ? (
                      <span className="font-semibold text-blue-600">
                        +{formatCurrency(item.orderAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    {item.paymentAmount ? (
                      <span className="font-semibold text-green-600">
                        -{formatCurrency(item.paymentAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`font-bold ${
                      item.balance > 0
                        ? 'text-red-600'
                        : item.balance < 0
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                    }`}>
                      {formatCurrency(item.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Balance Row */}
            <div className="bg-gray-100 border-t-2 border-gray-300 px-4 py-4 grid grid-cols-12 gap-4 font-bold">
              <div className="col-span-6 text-gray-900 text-base">SALDO FINAL</div>
              <div className="col-span-2 text-right text-blue-600">
                {formatCurrency(totalOrders)}
              </div>
              <div className="col-span-2 text-right text-green-600">
                {formatCurrency(totalPayments)}
              </div>
              <div className="col-span-2 text-right">
                <span className={`text-lg ${
                  currentBalance > 0
                    ? 'text-red-600'
                    : currentBalance < 0
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}>
                  {formatCurrency(Math.abs(currentBalance))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

