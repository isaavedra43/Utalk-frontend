import React from 'react';
import { Phone, Settings, Calendar, Copy, Plus, Bell, FileText, MoreVertical } from 'lucide-react';
import type { ClientProfile, ConversationDetails, NotificationSettings } from '../../types';

interface DetailsPanelProps {
  clientProfile: ClientProfile;
  conversationDetails: ConversationDetails;
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  isLoading?: boolean;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({
  clientProfile,
  conversationDetails,
  notificationSettings,
  onUpdateNotificationSettings,
  isLoading = false
}) => {
  // Generar iniciales del cliente
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Copiar al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Manejar cambio de configuración
  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    onUpdateNotificationSettings({ [key]: value });
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener color de la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mt-2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Perfil del Cliente */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Perfil del Cliente</h3>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
            {getInitials(clientProfile.name)}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">{clientProfile.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(clientProfile.status)}`}>
                {clientProfile.status === 'active' ? 'Activo' : clientProfile.status === 'inactive' ? 'Inactivo' : 'Bloqueado'}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {clientProfile.channel === 'whatsapp' ? 'WhatsApp' : clientProfile.channel}
              </span>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Información de Contacto */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Información de Contacto</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Teléfono</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-900">{clientProfile.phone}</span>
              <button 
                onClick={() => copyToClipboard(clientProfile.phone)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Copy className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Canal</span>
            </div>
            <span className="text-sm text-gray-900">
              {clientProfile.channel === 'whatsapp' ? 'WhatsApp' : clientProfile.channel}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Último contacto</span>
            </div>
            <span className="text-sm text-gray-900">{clientProfile.lastContact}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Cliente desde</span>
            </div>
            <span className="text-sm text-gray-900">{clientProfile.clientSince}</span>
          </div>

          {clientProfile.whatsappId && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">WhatsApp ID</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-900">{clientProfile.whatsappId}</span>
                <button 
                  onClick={() => copyToClipboard(clientProfile.whatsappId!)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Etiquetas */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Etiquetas</h3>
        <div className="flex flex-wrap gap-2">
          {clientProfile.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
          <button className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 flex items-center space-x-1">
            <Plus className="h-3 w-3" />
            <span>Añadir</span>
          </button>
        </div>
      </div>

      {/* Notificaciones y Configuración */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Notificaciones y Configuración</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Recibir notificaciones de esta conversación</span>
            </div>
            <button
              onClick={() => handleSettingChange('conversationNotifications', !notificationSettings.conversationNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.conversationNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.conversationNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Incluir en reportes de actividad</span>
            </div>
            <button
              onClick={() => handleSettingChange('reports', !notificationSettings.reports)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.reports ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.reports ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Recordatorios automáticos</span>
            </div>
            <button
              onClick={() => handleSettingChange('autoFollowUp', !notificationSettings.autoFollowUp)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.autoFollowUp ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.autoFollowUp ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Información de Conversación */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Información de Conversación</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Estado</span>
            <span className="text-sm text-gray-900 capitalize">{conversationDetails.status}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Prioridad</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(conversationDetails.priority)}`}>
              {conversationDetails.priority === 'urgent' ? 'Urgente' : 
               conversationDetails.priority === 'high' ? 'Alta' : 
               conversationDetails.priority === 'medium' ? 'Normal' : 'Baja'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Mensajes sin leer</span>
            <span className="text-sm text-gray-900">{conversationDetails.unreadCount}</span>
          </div>

          {conversationDetails.assignedToName && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Asignado a</span>
              <span className="text-sm text-gray-900">{conversationDetails.assignedToName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Integration Point */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">INTEGRATION POINT</h3>
        <p className="text-xs text-gray-600">
          Datos mapeados desde Twilio: displayName, wa_id, subscribed, last_interaction
        </p>
      </div>
    </div>
  );
}; 