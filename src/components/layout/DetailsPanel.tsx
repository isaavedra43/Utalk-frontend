import React, { useState } from 'react';
import { infoLog } from '../../config/logger';
import { Copy, MoreVertical, Phone, Mail, Calendar, MapPin, Bell, FileText, RefreshCw, Mail as MailIcon, Smartphone, FolderOpen, Plus, X, Users } from 'lucide-react';
import type { ClientProfile, ConversationDetails } from '../../types/sidebar';
import type { NotificationSettings } from '../../types/sidebar';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { ConversationFilesModal } from './ConversationFilesModal';

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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showFilesModal, setShowFilesModal] = useState(false);

  // NUEVO: Función wrapper para logging de cambios de notificaciones
  const handleNotificationChange = (setting: keyof NotificationSettings, value: boolean) => {
    if (import.meta.env.DEV) {
      infoLog('🔄 [DEBUG] Cambiando notificación:', { setting, value, currentSettings: notificationSettings });
    }
    onUpdateNotificationSettings({ [setting]: value });
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
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
                onClick={() => copyToClipboard(clientProfile.phone, 'phone')}
                className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                title={copiedField === 'phone' ? '¡Copiado!' : 'Copiar teléfono'}
              >
                <Copy className={`w-2.5 h-2.5 ${copiedField === 'phone' ? 'text-green-500' : 'text-gray-400'}`} />
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
                  onClick={() => copyToClipboard(clientProfile.whatsappId!, 'whatsapp')}
                  className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                  title={copiedField === 'whatsapp' ? '¡Copiado!' : 'Copiar WhatsApp ID'}
                >
                  <Copy className={`w-2.5 h-2.5 ${copiedField === 'whatsapp' ? 'text-green-500' : 'text-gray-400'}`} />
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center flex-1">
              <Bell className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <div>
                <div className="text-xs font-medium text-gray-900">Notificaciones de conversación</div>
                <div className="text-xs text-gray-500">Recibir alertas de nuevos mensajes</div>
              </div>
            </div>
            <ToggleSwitch
              key={`conversation-${notificationSettings.conversationNotifications}`}
              checked={notificationSettings.conversationNotifications}
              onChange={(checked) => handleNotificationChange('conversationNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center flex-1">
              <FileText className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <div>
                <div className="text-xs font-medium text-gray-900">Incluir en reportes</div>
                <div className="text-xs text-gray-500">Mostrar en reportes de actividad</div>
              </div>
            </div>
            <ToggleSwitch
              key={`reports-${notificationSettings.reports}`}
              checked={notificationSettings.reports}
              onChange={(checked) => handleNotificationChange('reports', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center flex-1">
              <RefreshCw className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <div>
                <div className="text-xs font-medium text-gray-900">Recordatorios automáticos</div>
                <div className="text-xs text-gray-500">Seguimiento automático de conversaciones</div>
              </div>
            </div>
            <ToggleSwitch
              key={`autoFollowUp-${notificationSettings.autoFollowUp}`}
              checked={notificationSettings.autoFollowUp}
              onChange={(checked) => handleNotificationChange('autoFollowUp', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center flex-1">
              <MailIcon className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <div>
                <div className="text-xs font-medium text-gray-900">Notificaciones por email</div>
                <div className="text-xs text-gray-500">Recibir alertas por correo electrónico</div>
              </div>
            </div>
            <ToggleSwitch
              key={`email-${notificationSettings.emailNotifications}`}
              checked={notificationSettings.emailNotifications}
              onChange={(checked) => handleNotificationChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center flex-1">
              <Smartphone className="w-3.5 h-3.5 text-gray-400 mr-2" />
              <div>
                <div className="text-xs font-medium text-gray-900">Notificaciones push</div>
                <div className="text-xs text-gray-500">Alertas en tiempo real en el dispositivo</div>
              </div>
            </div>
            <ToggleSwitch
              key={`push-${notificationSettings.pushNotifications}`}
              checked={notificationSettings.pushNotifications}
              onChange={(checked) => handleNotificationChange('pushNotifications', checked)}
            />
          </div>
        </div>
      </div>

      {/* Información de Conversación */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">Información de Conversación</h4>
          <button
            onClick={() => setShowFilesModal(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            title="Ver archivos de la conversación"
          >
            <FolderOpen className="w-3 h-3" />
            Archivos
          </button>
        </div>
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

      {/* Agentes Asignados */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">Agentes Asignados</h4>
          <button
            onClick={() => {
              // TODO: Implementar lógica para agregar agente
              infoLog('Agregar agente a conversación:', conversationDetails.id);
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
            title="Agregar agente a la conversación"
          >
            <Plus className="w-3 h-3" />
            Agregar
          </button>
        </div>
        
        {conversationDetails.assignedToName ? (
          <div className="space-y-2">
            {/* Agente principal asignado */}
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {conversationDetails.assignedToName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">{conversationDetails.assignedToName}</div>
                  <div className="text-xs text-gray-500">Agente principal</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-xs text-gray-500">En línea</span>
              </div>
            </div>
            
            {/* Lista de agentes adicionales (simulado) */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">M</span>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900">María González</div>
                  <div className="text-xs text-gray-500">Soporte técnico</div>
                </div>
              </div>
              <button
                onClick={() => {
                  // TODO: Implementar lógica para remover agente
                  infoLog('Remover agente María González');
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Remover agente"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mb-2">No hay agentes asignados</p>
            <button
              onClick={() => {
                // TODO: Implementar lógica para asignar primer agente
                infoLog('Asignar primer agente a conversación:', conversationDetails.id);
              }}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Asignar Agente
            </button>
          </div>
        )}
      </div>

      {/* Modal de Archivos de Conversación */}
      <ConversationFilesModal
        isOpen={showFilesModal}
        onClose={() => setShowFilesModal(false)}
        conversationId={conversationDetails.id}
        clientName={clientProfile.name}
      />
    </div>
  );
}; 