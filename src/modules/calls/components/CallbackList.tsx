import React, { useState } from 'react';
import { Clock, Phone, User, Calendar, Star, Plus, Edit, Trash2, MoreHorizontal, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const CallbackList: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Datos mock para demostración
  const callbacks = [
    {
      id: 'cb_1',
      contactId: 'contact_1',
      contactName: 'Juan Pérez',
      phoneNumber: '+525512345678',
      requestedBy: 'user_1',
      requestedByName: 'Ana García',
      scheduledFor: new Date('2024-11-22T14:00:00'),
      status: 'pending',
      priority: 'high',
      reason: 'Cliente solicitó callback para resolver problema técnico',
      notes: 'Problema con acceso a la cuenta, muy urgente',
      queueId: 'queue_1',
      queueName: 'Soporte',
      agentId: 'agent_1',
      agentName: 'Ana García',
      callId: undefined,
      attempts: 0,
      maxAttempts: 3,
      lastAttemptAt: undefined,
      completedAt: undefined,
      canceledAt: undefined,
      canceledBy: undefined,
      canceledReason: undefined,
      createdAt: new Date('2024-11-22T10:30:00'),
      updatedAt: new Date('2024-11-22T10:30:00'),
    },
    {
      id: 'cb_2',
      contactId: 'contact_2',
      contactName: 'María López',
      phoneNumber: '+525512345679',
      requestedBy: 'user_2',
      requestedByName: 'Carlos Rodríguez',
      scheduledFor: new Date('2024-11-22T15:30:00'),
      status: 'scheduled',
      priority: 'medium',
      reason: 'Cliente interesado en servicios, requiere información adicional',
      notes: 'Prospecto caliente, muy interesada en el producto premium',
      queueId: 'queue_2',
      queueName: 'Ventas',
      agentId: 'agent_2',
      agentName: 'Carlos Rodríguez',
      callId: undefined,
      attempts: 0,
      maxAttempts: 2,
      lastAttemptAt: undefined,
      completedAt: undefined,
      canceledAt: undefined,
      canceledBy: undefined,
      canceledReason: undefined,
      createdAt: new Date('2024-11-22T11:00:00'),
      updatedAt: new Date('2024-11-22T11:00:00'),
    },
    {
      id: 'cb_3',
      contactId: 'contact_3',
      contactName: 'Roberto Díaz',
      phoneNumber: '+525512345680',
      requestedBy: 'user_1',
      requestedByName: 'Ana García',
      scheduledFor: new Date('2024-11-22T16:00:00'),
      status: 'completed',
      priority: 'medium',
      reason: 'Problema de facturación resuelto',
      notes: 'Cliente satisfecho con la resolución',
      queueId: 'queue_1',
      queueName: 'Soporte',
      agentId: 'agent_1',
      agentName: 'Ana García',
      callId: 'call_3',
      attempts: 1,
      maxAttempts: 3,
      lastAttemptAt: new Date('2024-11-22T16:00:00'),
      completedAt: new Date('2024-11-22T16:15:00'),
      canceledAt: undefined,
      canceledBy: undefined,
      canceledReason: undefined,
      createdAt: new Date('2024-11-22T11:30:00'),
      updatedAt: new Date('2024-11-22T16:15:00'),
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'scheduled':
        return 'Programado';
      case 'completed':
        return 'Completado';
      case 'canceled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Star className="h-4 w-4 text-green-600" />;
      default:
        return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Callbacks</h2>
          <p className="text-gray-600">Gestiona las llamadas de retorno programadas</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Nuevo Callback</span>
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Callbacks</p>
              <p className="text-2xl font-bold text-gray-900">{callbacks.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {callbacks.filter(cb => cb.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programados</p>
              <p className="text-2xl font-bold text-gray-900">
                {callbacks.filter(cb => cb.status === 'scheduled').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {callbacks.filter(cb => cb.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de callbacks */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programado para
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignado a
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {callbacks.map((callback) => (
                <tr key={callback.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(callback.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(callback.status)}`}>
                        {getStatusText(callback.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{callback.contactName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{callback.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{formatDate(callback.scheduledFor)}</div>
                      <div className="text-sm text-gray-500">{formatTime(callback.scheduledFor)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(callback.priority)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(callback.priority)}`}>
                        {callback.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{callback.requestedByName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{callback.agentName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {callback.attempts}/{callback.maxAttempts}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="Realizar llamada">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Editar">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Más opciones">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
