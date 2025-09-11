import React, { useState } from 'react';
import { 
  X, 
  Info, 
  FileText, 
  BarChart3, 
  History, 
  Bot,
  Users,
  Settings,
  Calendar,
  Filter,
  Search,
  Send
} from 'lucide-react';
import { useInternalChat } from '../context/InternalChatContext';

interface InternalChatRightPanelProps {
  onClose: () => void;
}

export const InternalChatRightPanel: React.FC<InternalChatRightPanelProps> = ({ onClose }) => {
  const { state, actions } = useInternalChat();
  const [activeTab, setActiveTab] = useState('info');

  const activeChannel = state.activeChannel;

  const tabs = [
    { id: 'info', name: 'Información', icon: Info, badge: null },
    { id: 'files', name: 'Archivos', icon: FileText, badge: null },
    { id: 'canvas', name: 'Canvas', icon: BarChart3, badge: null },
    { id: 'audit', name: 'Auditoría', icon: History, badge: null },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <InfoTab channel={activeChannel} />;
      case 'files':
        return <FilesTab channel={activeChannel} />;
      case 'canvas':
        return <CanvasTab channel={activeChannel} />;
      case 'audit':
        return <AuditTab channel={activeChannel} />;
      default:
        return <InfoTab channel={activeChannel} />;
    }
  };

  if (!activeChannel) {
    return null;
  }

  return (
    <div className="w-full lg:w-[32rem] bg-white border-l border-gray-200 flex flex-col h-full internal-chat-right-panel">
      {/* Header del panel */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200">
        <h2 className="text-base lg:text-lg font-semibold text-gray-900">Detalles del Canal</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs de navegación */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] flex items-center justify-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-3 text-xs lg:text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconComponent className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.name}</span>
              {tab.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1 lg:px-2 py-1 min-w-[16px] lg:min-w-[20px] text-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido del tab activo */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Componente de pestaña de información
const InfoTab: React.FC<{ channel: any }> = ({ channel }) => {
  const members = [
    { id: '1', name: 'Ana C.', role: 'owner', isOnline: true, status: 'online' },
    { id: '2', name: 'Carlos D.', role: 'admin', isOnline: true, status: 'online' },
    { id: '3', name: 'Beatriz E.', role: 'agent', isOnline: true, status: 'away' },
    { id: '4', name: 'David F.', role: 'agent', isOnline: false, status: 'offline' },
    { id: '5', name: 'Elena G.', role: 'viewer', isOnline: false, status: 'inactive' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'offline': return 'bg-red-400';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'admin': return 'Admin';
      case 'agent': return 'Agent';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Resumen */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Resumen</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">Descripción: </span>
            <span className="text-gray-900">{channel.description}</span>
          </div>
          <div>
            <span className="text-gray-600">Privacidad: </span>
            <span className="text-gray-900">Privado</span>
          </div>
          <div>
            <span className="text-gray-600">Creado por: </span>
            <span className="text-gray-900">Ana C.</span>
          </div>
          <div>
            <span className="text-gray-600">Miembros: </span>
            <span className="text-gray-900">5</span>
          </div>
        </div>
      </div>

      {/* Miembros */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Miembros (5)</h3>
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} border-2 border-white rounded-full`}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{member.name}</span>
              </div>
              <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                {getRoleText(member.role)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs Rápidos */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">KPIs Rápidos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">1,284</p>
            <p className="text-xs text-gray-600">Mensajes (7d)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">256</p>
            <p className="text-xs text-gray-600">Archivos (7d)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-xs text-gray-600">Tareas Abiertas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">92.3%</p>
            <p className="text-xs text-gray-600">% SLA Cumplido</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de pestaña de archivos
const FilesTab: React.FC<{ channel: any }> = ({ channel }) => {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const files = [
    { id: '1', name: 'Comprobante_Pago_Innovate.jpg', type: 'image', size: '128 KB', uploader: 'Beatriz E.', date: 'Hace 2 horas' },
    { id: '2', name: 'Reporte_Ventas_Q3.pdf', type: 'document', size: '1.2 MB', uploader: 'Carlos D.', date: 'Ayer' },
    { id: '3', name: 'Minuta_Reunion_Octubre.docx', type: 'document', size: '45 KB', uploader: 'Ana C.', date: '24 Oct 2023' },
    { id: '4', name: 'Logo_Propuesta_V2.png', type: 'image', size: '256 KB', uploader: 'David F.', date: '23 Oct 2023' },
    { id: '5', name: 'feedback_audio_cliente.mp3', type: 'audio', size: '850 KB', uploader: 'Beatriz E.', date: '22 Oct 2023' },
    { id: '6', name: 'Factura_Servidores_AWS.pdf', type: 'document', size: '312 KB', uploader: 'Carlos D.', date: '21 Oct 2023' },
    { id: '7', name: 'Link a Figma', type: 'link', url: 'https://figma.com/file/...', uploader: 'Ana C.', date: '20 Oct 2023' },
    { id: '8', name: 'screenshot-error-01.jpg', type: 'image', size: '98 KB', uploader: 'David F.', date: '19 Oct 2023' },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'document': return '📄';
      case 'audio': return '🎵';
      case 'link': return '🔗';
      default: return '📄';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'todos' || file.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Archivos del Canal</h3>
      
      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {/* Filtros */}
      <div className="flex space-x-1 mb-4">
        {['todos', 'media', 'docs', 'enlaces'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 text-xs rounded ${
              activeFilter === filter
                ? 'bg-gray-200 text-gray-900 border border-gray-300'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Lista de archivos */}
      <div className="space-y-0">
        {filteredFiles.map((file) => (
          <div key={file.id} className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-lg">{getFileIcon(file.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {file.type === 'link' ? file.url : `${file.size} - ${file.uploader}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">{file.date}</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de pestaña de canvas
const CanvasTab: React.FC<{ channel: any }> = ({ channel }) => {
  const [viewType, setViewType] = useState('table');

  const requests = [
    {
      id: '1',
      client: 'Innovate Corp',
      amount: 'USD 1,250.00',
      status: 'pending',
      dateReceived: '26/10/2023 03:30',
      approver: null
    },
    {
      id: '2',
      client: 'Tech Solutions',
      amount: 'EUR 3,400.50',
      status: 'pending',
      dateReceived: '25/10/2023 05:00',
      approver: null
    },
    {
      id: '3',
      client: 'Global Exports',
      amount: 'JPY 8,500',
      status: 'approved',
      dateReceived: '24/10/2023 10:20',
      approver: 'Carlos D.'
    },
    {
      id: '4',
      client: 'Quantum Leap Inc',
      amount: 'USD 720.00',
      status: 'approved',
      dateReceived: '23/10/2023 04:00',
      approver: 'Carlos D.'
    },
    {
      id: '5',
      client: 'Starlight Ventures',
      amount: 'AUD 5,000.00',
      status: 'approved',
      dateReceived: '22/10/2023 08:45',
      approver: 'Carlos D.'
    },
    {
      id: '6',
      client: 'Nexus Dynamics',
      amount: 'EUR 980.75',
      status: 'rejected',
      dateReceived: '21/10/2023 12:10',
      approver: 'Carlos D.'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Pendiente</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-700">Aprobado</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-700">Rechazado</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Desconocido</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">Vistas de Canvas</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => setViewType('table')}
            className={`p-1 rounded ${viewType === 'table' ? 'bg-gray-200 text-gray-700' : 'text-gray-400'}`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewType('kanban')}
            className={`p-1 rounded ${viewType === 'kanban' ? 'bg-gray-200 text-gray-700' : 'text-gray-400'}`}
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewType('gallery')}
            className={`p-1 rounded ${viewType === 'gallery' ? 'bg-gray-200 text-gray-700' : 'text-gray-400'}`}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Tabla de solicitudes */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-700">Cliente</th>
              <th className="text-left py-2 font-medium text-gray-700">Monto</th>
              <th className="text-left py-2 font-medium text-gray-700">Estado</th>
              <th className="text-left py-2 font-medium text-gray-700">Fecha Recibido</th>
              <th className="text-left py-2 font-medium text-gray-700">Aprobador</th>
              <th className="text-left py-2 font-medium text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 text-gray-900">{request.client}</td>
                <td className="py-3 text-gray-900">{request.amount}</td>
                <td className="py-3">{getStatusBadge(request.status)}</td>
                <td className="py-3 text-gray-600">{request.dateReceived}</td>
                <td className="py-3">
                  {request.approver ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {request.approver.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{request.approver}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3">
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente de pestaña de auditoría
const AuditTab: React.FC<{ channel: any }> = ({ channel }) => {
  const [activeSubTab, setActiveSubTab] = useState('actividad');

  const auditLogs = [
    { 
      id: '1', 
      action: 'Nuevo pago de "Quantum Leap"', 
      user: 'David F.', 
      time: '10:00 AM', 
      type: 'message',
      icon: '💬'
    },
    { 
      id: '2', 
      action: 'Pago Aprobado', 
      user: 'Carlos D.', 
      time: '10:30 AM', 
      type: 'approval',
      icon: '✅',
      status: 'Aprobado'
    },
    { 
      id: '3', 
      action: 'Reenviado a #pedidos', 
      user: 'Carlos D.', 
      time: '10:31 AM', 
      type: 'forward',
      icon: '➡️'
    },
    { 
      id: '4', 
      action: 'Regla de reenvío actualizada', 
      user: 'Ana C.', 
      time: '11:15 AM', 
      type: 'config',
      icon: '⚙️'
    },
    { 
      id: '5', 
      action: 'SLA en riesgo (45m)', 
      user: 'Sistema', 
      time: '12:00 PM', 
      type: 'alert',
      icon: '⚠️',
      status: 'Alerta'
    },
    { 
      id: '6', 
      action: 'Pago Rechazado', 
      user: 'Carlos D.', 
      time: '01:20 PM', 
      type: 'rejection',
      icon: '❌',
      status: 'Rechazado'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprobado':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-700">Aprobado</span>;
      case 'Alerta':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-700">Alerta</span>;
      case 'Rechazado':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-700">Rechazado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Sub-tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveSubTab('actividad')}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium ${
            activeSubTab === 'actividad'
              ? 'text-gray-900 bg-gray-100 border-b-2 border-gray-300'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Actividad</span>
        </button>
        <button
          onClick={() => setActiveSubTab('configuracion')}
          className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium ${
            activeSubTab === 'configuracion'
              ? 'text-gray-900 bg-gray-100 border-b-2 border-gray-300'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </button>
      </div>
      
      {/* Lista de actividades */}
      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
            <div className="text-lg">{log.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{log.action}</p>
              <p className="text-xs text-gray-500">por {log.user} a las {log.time}</p>
              {log.status && (
                <div className="mt-1">
                  {getStatusBadge(log.status)}
                </div>
              )}
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Ver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

