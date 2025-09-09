import React, { useState } from 'react';
import {
  X,
  Settings,
  FileText,
  CheckCircle,
  Bell,
  ArrowRight,
  Shield,
  Plus,
  Edit,
  Trash2,
  User,
  Search
} from 'lucide-react';
import NewTemplateModal from './NewTemplateModal';

interface ChannelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: {
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    autoForwarding: boolean;
  };
}

const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({
  isOpen,
  onClose,
  channel
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [channelName, setChannelName] = useState(channel.name);
  const [channelDescription, setChannelDescription] = useState(channel.description);
  const [isPrivate, setIsPrivate] = useState(channel.isPrivate);
  const [autoForwarding, setAutoForwarding] = useState(channel.autoForwarding);
  const [approvalsEnabled, setApprovalsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [forwardingEnabled, setForwardingEnabled] = useState(true);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'requests', name: 'Solicitudes', icon: FileText },
    { id: 'approvals', name: 'Aprobaciones', icon: CheckCircle },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'forwarding', name: 'Reenvío', icon: ArrowRight },
    { id: 'permissions', name: 'Permisos', icon: Shield },
  ];

  const requestTemplates = [
    {
      id: '1',
      name: 'Pago',
      description: 'Solicitud estándar para aprobación de pagos.',
      version: 'v2',
      isDefault: true,
      icon: '✓'
    },
    {
      id: '2',
      name: 'Orden de Compra',
      description: 'Genera una orden de compra para un proveedor.',
      version: 'v1',
      isDefault: false,
      icon: '📄'
    },
    {
      id: '3',
      name: 'Alta de Proveedor',
      description: 'Inicia el proceso para dar de alta a un nuevo proveedor.',
      version: 'v1',
      isDefault: false,
      icon: '👤'
    }
  ];

  const members = [
    { id: '1', name: 'Ana C.', role: 'Administrador', avatar: 'AC' },
    { id: '2', name: 'Beatriz E.', role: 'Miembro', avatar: 'BE' },
    { id: '3', name: 'Carlos D.', role: 'Miembro', avatar: 'CD' }
  ];

  const approvers = [
    { id: '1', name: 'Carlos D.', avatar: 'CD' }
  ];

  const notificationRecipients = [
    { id: '1', name: 'Beatriz E.', avatar: 'BE' },
    { id: '2', name: 'David F.', avatar: 'DF' }
  ];

  const forwardingRules = [
    {
      id: '1',
      name: 'Aprobados a Pedidos',
      conditions: [
        { type: 'WHEN', value: 'approval.approved' },
        { type: 'TO', value: '#pedidos' },
        { type: 'MODE', value: 'canonical' }
      ],
      isActive: true
    }
  ];

  if (!isOpen) return null;

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Nombre del canal
        </label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Descripción
        </label>
        <textarea
          value={channelDescription}
          onChange={(e) => setChannelDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Canal privado
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Solo los miembros invitados pueden ver y participar en este canal.
          </p>
        </div>
        <button
          onClick={() => setIsPrivate(!isPrivate)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPrivate ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPrivate ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-900">
            Permitir Reenvío Automático
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Habilita el reenvío automático de mensajes estructurados a otros canales.
          </p>
        </div>
        <button
          onClick={() => setAutoForwarding(!autoForwarding)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            autoForwarding ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              autoForwarding ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Miembros del Canal
        </label>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar o añadir miembros..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {member.avatar}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRequestsTab = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Plantillas de Solicitud</h3>
          <p className="text-sm text-gray-500">
            Crea y gestiona las plantillas para los formularios de solicitudes de este canal.
          </p>
        </div>
        <button 
          onClick={() => setIsNewTemplateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Plantilla</span>
        </button>
      </div>

      <div className="space-y-4">
        {requestTemplates.map((template) => (
          <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">{template.icon}</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                  {template.isDefault && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{template.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">{template.version}</span>
              <button className="flex items-center space-x-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-900">
                <Edit className="h-3 w-3" />
                <span>Editar</span>
              </button>
              <button className="text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApprovalsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">
          Activar Aprobaciones en este Canal
        </label>
        <button
          onClick={() => setApprovalsEnabled(!approvalsEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            approvalsEnabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              approvalsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Aprobador del Canal</h3>
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {approvers[0].avatar}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-900">{approvers[0].name}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Solo este usuario (o los administradores) verán los botones para Aprobar/Rechazar.
        </p>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">
          Activar Notificaciones
        </label>
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Destinatarios</h3>
        <div className="flex flex-wrap gap-2">
          {notificationRecipients.map((recipient) => (
            <div key={recipient.id} className="flex items-center space-x-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-full">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {recipient.avatar}
                </span>
              </div>
              <span className="text-sm text-gray-900">{recipient.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Modos</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-900">In-App</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-900">Email</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" disabled className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-500">Push (próximamente)</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Eventos</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-900">Solicitud creada</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-900">Aprobación/Rechazo</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderForwardingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">
          Activar Reenvío Automático
        </label>
        <button
          onClick={() => setForwardingEnabled(!forwardingEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            forwardingEnabled ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              forwardingEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Crea reglas para reenviar mensajes automáticamente cuando se cumplan ciertas condiciones.
      </p>

      <div className="flex justify-end">
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Nueva Regla</span>
        </button>
      </div>

      <div className="space-y-4">
        {forwardingRules.map((rule) => (
          <div key={rule.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">{rule.name}</h4>
              <div className="flex items-center space-x-3">
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    rule.isActive ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      rule.isActive ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {rule.conditions.map((condition, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                  {condition.type}: {condition.value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div>
      <p className="text-sm text-gray-500">
        Define qué puede hacer cada rol dentro de este canal.
      </p>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'requests':
        return renderRequestsTab();
      case 'approvals':
        return renderApprovalsTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'forwarding':
        return renderForwardingTab();
      case 'permissions':
        return renderPermissionsTab();
      default:
        return renderGeneralTab();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Ajustes del Canal: {channel.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Administra los detalles, miembros y automatizaciones de este canal.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Modal de nueva plantilla */}
      <NewTemplateModal
        isOpen={isNewTemplateModalOpen}
        onClose={() => setIsNewTemplateModalOpen(false)}
        onSave={(template) => {
          console.log('Nueva plantilla guardada:', template);
          // Aquí se guardaría la plantilla en el estado o se enviaría al backend
        }}
      />
    </div>
  );
};

export default ChannelSettingsModal;
