import React, { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, FileText, Download, Printer } from 'lucide-react';
import type { PurchaseOrder, Payment } from '../types';

interface AccountStatementSectionProps {
  providerName: string;
  purchaseOrders: PurchaseOrder[];
  payments: Payment[];
  onExportPDF?: () => void;
}

export const AccountStatementSection: React.FC<AccountStatementSectionProps> = ({
  providerName,
  purchaseOrders,
  payments,
  onExportPDF,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30' | '60' | '90'>('all');

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

  // Calculate statement data
  const statementData = useMemo(() => {
    const now = new Date();
    const daysFilter = selectedPeriod === 'all' ? null : parseInt(selectedPeriod);
    const filterDate = daysFilter ? new Date(now.getTime() - daysFilter * 24 * 60 * 60 * 1000) : null;

    // Filter orders and payments by period
    const filteredOrders = purchaseOrders.filter(order => {
      if (!filterDate) return true;
      return new Date(order.createdAt) >= filterDate;
    });

    const filteredPayments = payments.filter(payment => {
      if (!filterDate) return true;
      return new Date(payment.paymentDate) >= filterDate;
    });

    // Calculate totals
    const totalOrders = filteredOrders
      .filter(o => ['sent', 'accepted', 'in_transit', 'delivered'].includes(o.status))
      .reduce((sum, order) => sum + order.total, 0);

    const totalPayments = filteredPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const currentBalance = totalOrders - totalPayments;

    // Prepare timeline items (both orders and payments combined and sorted)
    const timelineItems: Array<{
      id: string;
      type: 'order' | 'payment';
      date: string;
      description: string;
      orderAmount?: number;
      paymentAmount?: number;
      balance: number;
      status: string;
    }> = [];

    // Add orders
    filteredOrders.forEach(order => {
      if (['sent', 'accepted', 'in_transit', 'delivered'].includes(order.status)) {
        timelineItems.push({
          id: order.id,
          type: 'order',
          date: order.createdAt,
          description: `Orden de Compra #${order.orderNumber}`,
          orderAmount: order.total,
          balance: 0, // Will calculate later
          status: order.status,
        });
      }
    });

    // Add payments
    filteredPayments.forEach(payment => {
      if (payment.status === 'completed') {
        timelineItems.push({
          id: payment.id,
          type: 'payment',
          date: payment.paymentDate,
          description: `Pago #${payment.paymentNumber}${payment.orderNumber ? ` (Orden #${payment.orderNumber})` : ''}`,
          paymentAmount: payment.amount,
          balance: 0, // Will calculate later
          status: payment.status,
        });
      }
    });

    // Sort by date
    timelineItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let runningBalance = 0;
    timelineItems.forEach(item => {
      if (item.type === 'order') {
        runningBalance += item.orderAmount || 0;
      } else {
        runningBalance -= item.paymentAmount || 0;
      }
      item.balance = runningBalance;
    });

    return {
      totalOrders,
      totalPayments,
      currentBalance,
      timelineItems,
      ordersCount: filteredOrders.filter(o => ['sent', 'accepted', 'in_transit', 'delivered'].includes(o.status)).length,
      paymentsCount: filteredPayments.filter(p => p.status === 'completed').length,
    };
  }, [purchaseOrders, payments, selectedPeriod]);

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
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-blue-900">Total Órdenes</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(statementData.totalOrders)}</p>
          <p className="text-xs text-blue-700 mt-1">{statementData.ordersCount} órdenes</p>
        </div>

        {/* Total Payments */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-green-900">Total Pagos</p>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(statementData.totalPayments)}</p>
          <p className="text-xs text-green-700 mt-1">{statementData.paymentsCount} pagos</p>
        </div>

        {/* Current Balance */}
        <div className={`bg-gradient-to-br rounded-lg p-4 border col-span-1 md:col-span-2 ${
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
        
        {statementData.timelineItems.length === 0 ? (
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
              {statementData.timelineItems.map((item, index) => (
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
                      {formatCurrency(Math.abs(item.balance))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Balance Row */}
            <div className="bg-gray-100 border-t-2 border-gray-300 px-4 py-4 grid grid-cols-12 gap-4 font-bold">
              <div className="col-span-6 text-gray-900 text-base">SALDO FINAL</div>
              <div className="col-span-2 text-right text-blue-600">
                {formatCurrency(statementData.totalOrders)}
              </div>
              <div className="col-span-2 text-right text-green-600">
                {formatCurrency(statementData.totalPayments)}
              </div>
              <div className="col-span-2 text-right">
                <span className={`text-lg ${
                  statementData.currentBalance > 0
                    ? 'text-red-600'
                    : statementData.currentBalance < 0
                    ? 'text-yellow-600'
                    : 'text-gray-600'
                }`}>
                  {formatCurrency(Math.abs(statementData.currentBalance))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

