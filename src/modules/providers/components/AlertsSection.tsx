import React from 'react';
import { AlertCircle, Bell, Calendar, DollarSign, Package, TrendingUp, Clock } from 'lucide-react';
import type { Provider, PurchaseOrder, Payment } from '../types';

interface AlertsSectionProps {
  provider: Provider;
  purchaseOrders: PurchaseOrder[];
  payments: Payment[];
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({
  provider,
  purchaseOrders,
  payments,
}) => {
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    const now = new Date();

    // 1. Órdenes pendientes por mucho tiempo
    const pendingOrders = purchaseOrders.filter(o => o.status === 'sent' || o.status === 'accepted');
    pendingOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const daysPending = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPending > 7) {
        alerts.push({
          id: `pending-order-${order.id}`,
          type: 'warning',
          icon: Clock,
          title: `Orden #${order.orderNumber} pendiente`,
          description: `Esta orden tiene ${daysPending} días sin completarse. Considera hacer seguimiento.`,
        });
      }
    });

    // 2. Órdenes con fecha de entrega próxima
    purchaseOrders.forEach(order => {
      if (order.expectedDeliveryDate && (order.status === 'accepted' || order.status === 'sent')) {
        const deliveryDate = new Date(order.expectedDeliveryDate);
        const daysUntilDelivery = Math.floor((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDelivery >= 0 && daysUntilDelivery <= 3) {
          alerts.push({
            id: `delivery-soon-${order.id}`,
            type: 'info',
            icon: Package,
            title: `Entrega próxima - Orden #${order.orderNumber}`,
            description: `Se espera la entrega ${daysUntilDelivery === 0 ? 'hoy' : `en ${daysUntilDelivery} ${daysUntilDelivery === 1 ? 'día' : 'días'}`}.`,
          });
        } else if (daysUntilDelivery < 0) {
          alerts.push({
            id: `delivery-late-${order.id}`,
            type: 'error',
            icon: AlertCircle,
            title: `Entrega atrasada - Orden #${order.orderNumber}`,
            description: `La entrega está atrasada por ${Math.abs(daysUntilDelivery)} ${Math.abs(daysUntilDelivery) === 1 ? 'día' : 'días'}.`,
          });
        }
      }
    });

    // 3. Saldo pendiente alto
    const totalOrders = purchaseOrders
      .filter(o => ['sent', 'accepted', 'in_transit', 'delivered'].includes(o.status))
      .reduce((sum, order) => sum + order.total, 0);
    
    const totalPayments = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const balance = totalOrders - totalPayments;
    
    if (balance > 50000) {
      alerts.push({
        id: 'high-balance',
        type: 'warning',
        icon: DollarSign,
        title: 'Saldo pendiente alto',
        description: `Tienes un saldo pendiente de ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(balance)}. Considera programar un pago.`,
      });
    } else if (balance < 0) {
      alerts.push({
        id: 'credit-balance',
        type: 'success',
        icon: TrendingUp,
        title: 'Saldo a favor',
        description: `El proveedor te debe ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Math.abs(balance))}.`,
      });
    }

    // 4. Sin actividad reciente
    if (purchaseOrders.length === 0) {
      alerts.push({
        id: 'no-orders',
        type: 'info',
        icon: Package,
        title: 'Sin órdenes de compra',
        description: 'No has realizado órdenes de compra con este proveedor. Crea la primera orden.',
      });
    } else {
      const lastOrder = purchaseOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      const lastOrderDate = new Date(lastOrder.createdAt);
      const daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastOrder > 60) {
        alerts.push({
          id: 'inactive',
          type: 'info',
          icon: Calendar,
          title: 'Sin actividad reciente',
          description: `No has realizado órdenes con este proveedor en ${daysSinceLastOrder} días.`,
        });
      }
    }

    // 5. Proveedor inactivo
    if (provider.isActive === false) {
      alerts.push({
        id: 'provider-inactive',
        type: 'error',
        icon: AlertCircle,
        title: 'Proveedor inactivo',
        description: 'Este proveedor está marcado como inactivo. Considera activarlo si deseas realizar pedidos.',
      });
    }

    // 6. Falta información del proveedor
    const missingInfo: string[] = [];
    if (!provider.email) missingInfo.push('email');
    if (!provider.address) missingInfo.push('dirección');
    if (!provider.phone) missingInfo.push('teléfono');
    if (!provider.taxId) missingInfo.push('RFC');
    
    if (missingInfo.length > 0) {
      alerts.push({
        id: 'missing-info',
        type: 'warning',
        icon: AlertCircle,
        title: 'Información incompleta',
        description: `Falta agregar: ${missingInfo.join(', ')}. Esto puede dificultar la comunicación.`,
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const alertStyles = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      text: 'text-yellow-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-700',
    },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Alertas y Recordatorios</h3>
          <p className="text-sm text-gray-500 mt-1">
            {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'} {alerts.length === 1 ? 'activa' : 'activas'}
          </p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <Bell className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay alertas en este momento</p>
          <p className="text-sm text-gray-400 mt-1">Todo está en orden con este proveedor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const styles = alertStyles[alert.type];
            const Icon = alert.icon;
            
            return (
              <div
                key={alert.id}
                className={`${styles.bg} border ${styles.border} rounded-lg p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 ${styles.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${styles.title} mb-1`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm ${styles.text}`}>
                      {alert.description}
                    </p>
                    {alert.action && (
                      <button
                        onClick={alert.action.onClick}
                        className={`mt-2 text-sm font-medium ${styles.icon} hover:underline`}
                      >
                        {alert.action.label} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Card */}
      {alerts.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-gray-900">Resumen de Alertas</h5>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  {alerts.filter(a => a.type === 'error').length} Críticas
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  {alerts.filter(a => a.type === 'warning').length} Advertencias
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {alerts.filter(a => a.type === 'info').length} Informativas
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

