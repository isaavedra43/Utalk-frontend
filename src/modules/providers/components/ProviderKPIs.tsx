import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import type { PurchaseOrder, Payment, ProviderMaterial } from '../types';

interface ProviderKPIsProps {
  purchaseOrders: PurchaseOrder[];
  payments: Payment[];
  materials: ProviderMaterial[];
}

export const ProviderKPIs: React.FC<ProviderKPIsProps> = ({
  purchaseOrders,
  payments,
  materials,
}) => {
  const kpis = useMemo(() => {
    // Total gastado
    const totalSpent = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Total en órdenes
    const totalOrders = purchaseOrders
      .filter(o => ['sent', 'accepted', 'in_transit', 'delivered'].includes(o.status))
      .reduce((sum, order) => sum + order.total, 0);

    // Saldo pendiente
    const balance = totalOrders - totalSpent;

    // Número de órdenes
    const ordersCount = purchaseOrders.length;
    const completedOrders = purchaseOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = purchaseOrders.filter(o => o.status === 'cancelled').length;
    const pendingOrders = purchaseOrders.filter(o => ['sent', 'accepted', 'in_transit'].includes(o.status)).length;

    // Tasa de cumplimiento
    const completionRate = ordersCount > 0 ? (completedOrders / ordersCount) * 100 : 0;

    // Ticket promedio
    const averageOrderValue = ordersCount > 0 ? totalOrders / ordersCount : 0;

    // Tiempo promedio de entrega
    const deliveredOrders = purchaseOrders.filter(o => o.status === 'delivered' && o.deliveredAt);
    const avgDeliveryTime = deliveredOrders.length > 0
      ? deliveredOrders.reduce((sum, order) => {
          const created = new Date(order.createdAt);
          const delivered = new Date(order.deliveredAt!);
          return sum + Math.floor((delivered.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / deliveredOrders.length
      : 0;

    // Entregas a tiempo
    const onTimeDeliveries = deliveredOrders.filter(order => {
      if (!order.expectedDeliveryDate) return true;
      const expected = new Date(order.expectedDeliveryDate);
      const delivered = new Date(order.deliveredAt!);
      return delivered <= expected;
    }).length;

    const onTimeRate = deliveredOrders.length > 0 
      ? (onTimeDeliveries / deliveredOrders.length) * 100 
      : 100;

    // Materiales activos
    const activeMaterials = materials.filter(m => m.isActive).length;

    // Última orden
    const lastOrder = purchaseOrders.length > 0
      ? purchaseOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

    const daysSinceLastOrder = lastOrder
      ? Math.floor((new Date().getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      totalSpent,
      totalOrders,
      balance,
      ordersCount,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      completionRate,
      averageOrderValue,
      avgDeliveryTime,
      onTimeRate,
      activeMaterials,
      daysSinceLastOrder,
    };
  }, [purchaseOrders, payments, materials]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const kpiCards = [
    {
      label: 'Total Gastado',
      value: formatCurrency(kpis.totalSpent),
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: kpis.totalSpent > 0 ? 'up' : null,
    },
    {
      label: 'Órdenes de Compra',
      value: kpis.ordersCount.toString(),
      subtitle: `${kpis.completedOrders} completadas, ${kpis.pendingOrders} pendientes`,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Ticket Promedio',
      value: formatCurrency(kpis.averageOrderValue),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Saldo Pendiente',
      value: formatCurrency(Math.abs(kpis.balance)),
      subtitle: kpis.balance > 0 ? 'Debes al proveedor' : kpis.balance < 0 ? 'El proveedor te debe' : 'Sin saldo',
      icon: DollarSign,
      color: kpis.balance > 0 ? 'text-red-600' : kpis.balance < 0 ? 'text-yellow-600' : 'text-gray-600',
      bg: kpis.balance > 0 ? 'bg-red-50' : kpis.balance < 0 ? 'bg-yellow-50' : 'bg-gray-50',
    },
    {
      label: 'Tasa de Cumplimiento',
      value: `${kpis.completionRate.toFixed(1)}%`,
      subtitle: `${kpis.completedOrders} de ${kpis.ordersCount} órdenes`,
      icon: CheckCircle,
      color: kpis.completionRate >= 80 ? 'text-green-600' : kpis.completionRate >= 60 ? 'text-yellow-600' : 'text-red-600',
      bg: kpis.completionRate >= 80 ? 'bg-green-50' : kpis.completionRate >= 60 ? 'bg-yellow-50' : 'bg-red-50',
    },
    {
      label: 'Entregas a Tiempo',
      value: `${kpis.onTimeRate.toFixed(1)}%`,
      subtitle: `${Math.round(kpis.avgDeliveryTime)} días promedio`,
      icon: Clock,
      color: kpis.onTimeRate >= 80 ? 'text-green-600' : kpis.onTimeRate >= 60 ? 'text-yellow-600' : 'text-red-600',
      bg: kpis.onTimeRate >= 80 ? 'bg-green-50' : kpis.onTimeRate >= 60 ? 'bg-yellow-50' : 'bg-red-50',
    },
    {
      label: 'Materiales Disponibles',
      value: kpis.activeMaterials.toString(),
      subtitle: `${materials.length} totales`,
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Última Actividad',
      value: kpis.daysSinceLastOrder !== null 
        ? kpis.daysSinceLastOrder === 0 
          ? 'Hoy' 
          : `Hace ${kpis.daysSinceLastOrder} días`
        : 'Sin órdenes',
      icon: Calendar,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Métricas y KPIs</h3>
        <p className="text-sm text-gray-500 mt-1">
          Indicadores clave de rendimiento del proveedor
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                {kpi.trend && (
                  <div className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend === 'up' ? '↑' : '↓'}
                  </div>
                )}
              </div>

              <p className="text-xs font-medium text-gray-600 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
              {kpi.subtitle && (
                <p className="text-xs text-gray-500">{kpi.subtitle}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Resumen de Rendimiento</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Performance Score */}
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Puntuación General</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {((kpis.completionRate + kpis.onTimeRate) / 2).toFixed(0)}
              </span>
              <span className="text-lg text-gray-600 mb-1">/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((kpis.completionRate + kpis.onTimeRate) / 2)}%` }}
              />
            </div>
          </div>

          {/* Reliability */}
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Confiabilidad</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cumplimiento:</span>
                <span className="font-semibold">{kpis.completionRate.toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Puntualidad:</span>
                <span className="font-semibold">{kpis.onTimeRate.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white/60 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Actividad</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total órdenes:</span>
                <span className="font-semibold">{kpis.ordersCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Última orden:</span>
                <span className="font-semibold">
                  {kpis.daysSinceLastOrder !== null 
                    ? `${kpis.daysSinceLastOrder}d`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

