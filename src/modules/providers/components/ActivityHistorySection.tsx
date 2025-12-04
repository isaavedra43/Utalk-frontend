import React, { useState, useMemo } from 'react';
import { Clock, User, FileText, Package, DollarSign, Edit3, Trash2, PlusCircle, CheckCircle, XCircle, Filter } from 'lucide-react';
import type { ProviderActivity } from '../types';

interface ActivityHistorySectionProps {
  activities: ProviderActivity[];
}

export const ActivityHistorySection: React.FC<ActivityHistorySectionProps> = ({
  activities,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const activityConfig = {
    created: { label: 'Proveedor creado', icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    updated: { label: 'Información actualizada', icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50' },
    order_created: { label: 'Orden creada', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    order_updated: { label: 'Orden actualizada', icon: Edit3, color: 'text-purple-600', bg: 'bg-purple-50' },
    order_accepted: { label: 'Orden aceptada', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    order_rejected: { label: 'Orden rechazada', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    order_delivered: { label: 'Orden entregada', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    payment_created: { label: 'Pago registrado', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    payment_completed: { label: 'Pago completado', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    material_added: { label: 'Material agregado', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    material_updated: { label: 'Material actualizado', icon: Edit3, color: 'text-blue-600', bg: 'bg-blue-50' },
    material_deleted: { label: 'Material eliminado', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50' },
    note_added: { label: 'Nota agregada', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' },
    document_uploaded: { label: 'Documento subido', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    status_changed: { label: 'Estado cambiado', icon: Edit3, color: 'text-orange-600', bg: 'bg-orange-50' },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities;
    
    const typeGroups: Record<string, string[]> = {
      orders: ['order_created', 'order_updated', 'order_accepted', 'order_rejected', 'order_delivered'],
      payments: ['payment_created', 'payment_completed'],
      materials: ['material_added', 'material_updated', 'material_deleted'],
      provider: ['created', 'updated', 'status_changed'],
      others: ['note_added', 'document_uploaded'],
    };

    return activities.filter(activity => typeGroups[filterType]?.includes(activity.type));
  }, [activities, filterType]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ProviderActivity[]> = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.createdAt);
      const dateKey = date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return groups;
  }, [filteredActivities]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Historial de Actividades</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredActivities.length} {filteredActivities.length === 1 ? 'actividad' : 'actividades'}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">Todas las actividades</option>
            <option value="orders">Órdenes de compra</option>
            <option value="payments">Pagos</option>
            <option value="materials">Materiales</option>
            <option value="provider">Información del proveedor</option>
            <option value="others">Otros</option>
          </select>
        </div>
      </div>

      {/* Activities Timeline */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay actividades registradas</p>
          {filterType !== 'all' && (
            <p className="text-sm text-gray-400 mt-1">Intenta con otro filtro</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([dateKey, dayActivities]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-gray-200" />
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {dateKey}
                </h4>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Activities for this day */}
              <div className="space-y-2">
                {dayActivities.map((activity) => {
                  const config = activityConfig[activity.type] || activityConfig.updated;
                  const ActivityIcon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                        <ActivityIcon className={`w-5 h-5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{config.label}</h5>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <User className="w-3 h-3" />
                          <span>{activity.createdByName}</span>
                        </div>

                        {/* Additional Details */}
                        {activity.details && Object.keys(activity.details).length > 0 && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                            <details className="cursor-pointer">
                              <summary className="text-gray-600 hover:text-gray-900 font-medium">
                                Ver detalles
                              </summary>
                              <div className="mt-2 space-y-1 text-gray-600">
                                {Object.entries(activity.details).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="font-medium">{key}:</span>
                                    <span>{JSON.stringify(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

