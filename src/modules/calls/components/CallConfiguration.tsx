import React, { useState } from 'react';
import { Settings, Phone, Users, Clock, Shield, Bell, Database, Globe, Mic, MicOff, FileText, Download, Upload, Plus, Edit, Trash2, Save, X } from 'lucide-react';

export const CallConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('numbers');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabs = [
    { id: 'numbers', name: 'Números', icon: Phone },
    { id: 'queues', name: 'Colas', icon: Users },
    { id: 'ivr', name: 'IVR', icon: Settings },
    { id: 'agents', name: 'Agentes', icon: Users },
    { id: 'recording', name: 'Grabación', icon: Mic },
    { id: 'compliance', name: 'Cumplimiento', icon: Shield },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'integrations', name: 'Integraciones', icon: Globe },
  ];

  // Datos mock para demostración
  const phoneNumbers = [
    {
      id: 'num_1',
      number: '+525598765432',
      friendlyName: 'Soporte Principal',
      country: 'México',
      region: 'CDMX',
      type: 'local',
      capabilities: { voice: true, sms: false, mms: false, fax: false, video: false },
      status: 'active',
      assignedTo: 'queue_1',
      assignedToName: 'Soporte',
      cost: 0.05,
      currency: 'USD',
      provider: 'Twilio',
      providerId: 'PN1234567890abcdef',
      twilioSid: 'PN1234567890abcdef',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-22'),
    },
    {
      id: 'num_2',
      number: '+525598765433',
      friendlyName: 'Ventas',
      country: 'México',
      region: 'CDMX',
      type: 'local',
      capabilities: { voice: true, sms: true, mms: false, fax: false, video: false },
      status: 'active',
      assignedTo: 'queue_2',
      assignedToName: 'Ventas',
      cost: 0.05,
      currency: 'USD',
      provider: 'Twilio',
      providerId: 'PN2345678901bcdef',
      twilioSid: 'PN2345678901bcdef',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-11-22'),
    }
  ];

  const queues = [
    {
      id: 'queue_1',
      name: 'Soporte',
      description: 'Cola principal de soporte técnico',
      skills: ['soporte', 'tecnico', 'resolucion'],
      priorities: [
        { skill: 'soporte', priority: 1, weight: 100 },
        { skill: 'tecnico', priority: 2, weight: 80 },
        { skill: 'resolucion', priority: 3, weight: 60 }
      ],
      hours: {
        timezone: 'America/Mexico_City',
        schedule: [
          { day: 1, startTime: '09:00', endTime: '18:00', isActive: true },
          { day: 2, startTime: '09:00', endTime: '18:00', isActive: true },
          { day: 3, startTime: '09:00', endTime: '18:00', isActive: true },
          { day: 4, startTime: '09:00', endTime: '18:00', isActive: true },
          { day: 5, startTime: '09:00', endTime: '18:00', isActive: true },
          { day: 6, startTime: '10:00', endTime: '14:00', isActive: true },
          { day: 0, startTime: '00:00', endTime: '00:00', isActive: false }
        ]
      },
      holidays: [
        { name: 'Día de la Independencia', date: new Date('2024-09-16'), isActive: true },
        { name: 'Día de Muertos', date: new Date('2024-11-02'), isActive: true }
      ],
      overflow: {
        enabled: true,
        maxWaitTime: 300,
        overflowQueueId: 'queue_2',
        overflowMessage: 'Todos nuestros agentes están ocupados. Su llamada será transferida a ventas.',
        overflowAction: 'transfer'
      },
      routing: {
        strategy: 'skill-based',
        maxAgents: 10,
        allowCallback: true,
        callbackMessage: '¿Desea que le llamemos de vuelta?',
        callbackTimeout: 30,
        languageRouting: true,
        vipRouting: true,
        skillBasedRouting: true
      },
      settings: {
        maxCallers: 50,
        maxWaitTime: 600,
        holdMusic: 'default',
        positionAnnouncement: true,
        estimatedWaitTime: true,
        callbackEnabled: true,
        recordingEnabled: true,
        transcriptionEnabled: true,
        consentRequired: true,
        consentMessage: 'Esta llamada puede ser grabada para fines de calidad.',
        whisperEnabled: true,
        bargeEnabled: true,
        monitoringEnabled: true
      },
      metrics: {
        callsInQueue: 5,
        callsWaiting: 3,
        averageWaitTime: 120,
        averageServiceTime: 480,
        serviceLevel: 85,
        abandonmentRate: 12,
        occupancyRate: 78,
        agentCount: 8,
        availableAgents: 3,
        busyAgents: 5,
        lastUpdated: new Date('2024-11-22T15:30:00')
      },
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-22'),
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'numbers':
        return <NumbersTab numbers={phoneNumbers} />;
      case 'queues':
        return <QueuesTab queues={queues} />;
      case 'ivr':
        return <IVRTab />;
      case 'agents':
        return <AgentsTab />;
      case 'recording':
        return <RecordingTab />;
      case 'compliance':
        return <ComplianceTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'integrations':
        return <IntegrationsTab />;
      default:
        return <NumbersTab numbers={phoneNumbers} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
          <p className="text-gray-600">Gestiona la configuración del centro de llamadas</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar Config</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Importar Config</span>
          </button>
        </div>
      </div>

      {/* Navegación de tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido del tab activo */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Componentes de tabs
const NumbersTab: React.FC<{ numbers: any[] }> = ({ numbers }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Números de Teléfono</h3>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Comprar Número</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidades</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {numbers.map((number) => (
                <tr key={number.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{number.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{number.friendlyName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{number.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {number.capabilities.voice && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Voz</span>}
                      {number.capabilities.sms && <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">SMS</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{number.assignedToName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      number.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {number.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Editar</button>
                      <button className="text-gray-600 hover:text-gray-900">Configurar</button>
                      <button className="text-red-600 hover:text-red-900">Eliminar</button>
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

const QueuesTab: React.FC<{ queues: any[] }> = ({ queues }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Colas de Llamadas</h3>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Nueva Cola</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queues.map((queue) => (
          <div key={queue.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{queue.name}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                queue.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {queue.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Agentes:</span>
                <span className="text-sm font-medium text-gray-900">{queue.metrics.agentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">En cola:</span>
                <span className="text-sm font-medium text-gray-900">{queue.metrics.callsInQueue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nivel de servicio:</span>
                <span className="text-sm font-medium text-gray-900">{queue.metrics.serviceLevel}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tiempo promedio:</span>
                <span className="text-sm font-medium text-gray-900">{queue.metrics.averageWaitTime}s</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{queue.description}</span>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm">Editar</button>
                  <button className="text-gray-600 hover:text-gray-900 text-sm">Configurar</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const IVRTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Flujos IVR</h3>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Nuevo Flujo</span>
        </button>
      </div>
      
      <div className="text-center py-12">
        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración de IVR</h3>
        <p className="text-gray-600">Crea y gestiona flujos de respuesta de voz interactiva</p>
      </div>
    </div>
  );
};

const AgentsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Agentes</h3>
        <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Nuevo Agente</span>
        </button>
      </div>
      
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Agentes</h3>
        <p className="text-gray-600">Configura permisos, habilidades y configuraciones de agentes</p>
      </div>
    </div>
  );
};

const RecordingTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Configuración de Grabación</h3>
      
      <div className="text-center py-12">
        <Mic className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Políticas de Grabación</h3>
        <p className="text-gray-600">Configura políticas de grabación, retención y cumplimiento</p>
      </div>
    </div>
  );
};

const ComplianceTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Cumplimiento y Seguridad</h3>
      
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración de Cumplimiento</h3>
        <p className="text-gray-600">Gestiona políticas de cumplimiento, consentimiento y seguridad</p>
      </div>
    </div>
  );
};

const NotificationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
      
      <div className="text-center py-12">
        <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuración de Notificaciones</h3>
        <p className="text-gray-600">Configura alertas y notificaciones del sistema</p>
      </div>
    </div>
  );
};

const IntegrationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Integraciones</h3>
      
      <div className="text-center py-12">
        <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Integraciones del Sistema</h3>
        <p className="text-gray-600">Configura integraciones con CRM, calendarios y otros sistemas</p>
      </div>
    </div>
  );
};
