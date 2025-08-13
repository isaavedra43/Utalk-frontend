import React from 'react';
import { Copy, MoreVertical, Phone, Mail, Calendar, MapPin } from 'lucide-react';
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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Generar iniciales del nombre
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1.5"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {/* Perfil del Cliente */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Perfil del Cliente</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
            {getInitials(clientProfile.name)}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm">{clientProfile.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activo
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                WhatsApp
              </span>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        {/* Información de Contacto */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">Teléfono</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium">{clientProfile.phone}</span>
              <button 
                onClick={() => copyToClipboard(clientProfile.phone)}
                className="p-0.5 hover:bg-gray-100 rounded"
              >
                <Copy className="w-2.5 h-2.5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">Canal</span>
            </div>
            <span className="text-xs font-medium">{clientProfile.channel}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">Último contacto</span>
            </div>
            <span className="text-xs text-gray-500">{clientProfile.lastContact || 'No disponible'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">Cliente desde</span>
            </div>
            <span className="text-xs text-gray-500">{clientProfile.clientSince || 'No disponible'}</span>
          </div>

          {clientProfile.whatsappId && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">WhatsApp ID</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium">{clientProfile.whatsappId}</span>
                <button 
                  onClick={() => copyToClipboard(clientProfile.whatsappId!)}
                  className="p-0.5 hover:bg-gray-100 rounded"
                >
                  <Copy className="w-2.5 h-2.5 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Etiquetas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">Etiquetas</h4>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            + Añadir
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {clientProfile.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Notificaciones y Configuración */}
      <div>
        <h4 className="font-medium text-gray-900 text-sm mb-2">Notificaciones y Configuración</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Recibir notificaciones de esta conversación</span>
            <button
              onClick={() => onUpdateNotificationSettings({ conversationNotifications: !notificationSettings.conversationNotifications })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                notificationSettings.conversationNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  notificationSettings.conversationNotifications ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Incluir en reportes de actividad</span>
            <button
              onClick={() => onUpdateNotificationSettings({ reports: !notificationSettings.reports })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                notificationSettings.reports ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  notificationSettings.reports ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Recordatorios automáticos</span>
            <button
              onClick={() => onUpdateNotificationSettings({ autoFollowUp: !notificationSettings.autoFollowUp })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                notificationSettings.autoFollowUp ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  notificationSettings.autoFollowUp ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Información de Conversación */}
      <div>
        <h4 className="font-medium text-gray-900 text-sm mb-2">Información de Conversación</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Estado</span>
            <span className="text-xs font-medium">{conversationDetails.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Prioridad</span>
            <span className="text-xs font-medium">{conversationDetails.priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Mensajes sin leer</span>
            <span className="text-xs font-medium">{conversationDetails.unreadCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Asignado a</span>
            <span className="text-xs font-medium">{conversationDetails.assignedToName || 'No asignado'}</span>
          </div>
        </div>
      </div>

      {/* Punto de Integración */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 text-sm mb-1">INTEGRATION POINT</h4>
        <p className="text-xs text-gray-500">
          Datos mapeados desde Twilio: displayName, wa_id, subscribed, last_interaction
        </p>
      </div>
    </div>
  );
}; 