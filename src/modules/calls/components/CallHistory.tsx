import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  FileText,
  MessageSquare,
  Star,
  Tag,
  Clock,
  User,
  Building2,
  Calendar,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share
} from 'lucide-react';
import type { Call, CallFilter, CallDirection, CallStatus } from '../../../types/calls';

export const CallHistory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CallFilter>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const [playingCall, setPlayingCall] = useState<string | null>(null);

  // Datos mock para demostración
  const calls: Call[] = [
    {
      id: 'call_1',
      sid: 'CA1234567890abcdef1234567890abcdef',
      direction: 'inbound',
      from: '+525512345678',
      to: '+525598765432',
      fromName: 'Juan Pérez',
      toName: 'Soporte Técnico',
      startTime: new Date('2024-11-22T10:30:00'),
      endTime: new Date('2024-11-22T10:45:00'),
      duration: 900, // 15 minutos
      status: 'completed',
      queueId: 'queue_1',
      queueName: 'Soporte',
      agentId: 'agent_1',
      agentName: 'Ana García',
      contactId: 'contact_1',
      contactName: 'Juan Pérez',
      companyId: 'company_1',
      companyName: 'Empresa ABC',
      recordingUrl: 'https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE123.mp3',
      recordingStatus: 'recording',
      transcriptId: 'transcript_1',
      transcriptStatus: 'completed',
      sentiment: 'positive',
      summaryId: 'summary_1',
      dispositions: ['resuelto', 'satisfecho'],
      tags: ['soporte', 'tecnico', 'urgente'],
      qaScore: 4.5,
      qaReviewId: 'qa_1',
      talkTime: 840,
      holdTime: 60,
      silenceTime: 0,
      acwTime: 120,
      cost: 0.15,
      currency: 'USD',
      metadata: {
        callerId: '+525512345678',
        callerName: 'Juan Pérez',
        callerLocation: 'Ciudad de México',
        callerTimezone: 'America/Mexico_City',
        callerLanguage: 'es',
        callerType: 'customer',
        callerSegment: 'premium',
        callReason: 'Soporte técnico',
        callOutcome: 'Resuelto',
        callNotes: 'Cliente satisfecho con la resolución',
        callTags: ['soporte', 'tecnico', 'urgente'],
        callDisposition: 'resuelto',
        callCategory: 'soporte',
        callPriority: 'medium',
        callSource: 'web',
        callCampaign: 'soporte_2024',
      },
      createdAt: new Date('2024-11-22T10:30:00'),
      updatedAt: new Date('2024-11-22T10:45:00'),
    },
    {
      id: 'call_2',
      sid: 'CA2345678901bcdef1234567890abcdef',
      direction: 'outbound',
      from: '+525598765432',
      to: '+525512345679',
      fromName: 'Ana García',
      toName: 'María López',
      startTime: new Date('2024-11-22T11:00:00'),
      endTime: new Date('2024-11-22T11:12:00'),
      duration: 720, // 12 minutos
      status: 'completed',
      queueId: 'queue_2',
      queueName: 'Ventas',
      agentId: 'agent_1',
      agentName: 'Ana García',
      contactId: 'contact_2',
      contactName: 'María López',
      companyId: 'company_2',
      companyName: 'Empresa XYZ',
      recordingUrl: 'https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE124.mp3',
      recordingStatus: 'recording',
      transcriptId: 'transcript_2',
      transcriptStatus: 'completed',
      sentiment: 'neutral',
      summaryId: 'summary_2',
      dispositions: ['interesado', 'callback'],
      tags: ['ventas', 'prospecto', 'seguimiento'],
      qaScore: 3.8,
      qaReviewId: 'qa_2',
      talkTime: 680,
      holdTime: 40,
      silenceTime: 0,
      acwTime: 90,
      cost: 0.12,
      currency: 'USD',
      metadata: {
        callerId: '+525598765432',
        callerName: 'Ana García',
        callerLocation: 'Ciudad de México',
        callerTimezone: 'America/Mexico_City',
        callerLanguage: 'es',
        callerType: 'agent',
        callerSegment: 'standard',
        callReason: 'Seguimiento de ventas',
        callOutcome: 'Interesado',
        callNotes: 'Cliente interesado, requiere callback',
        callTags: ['ventas', 'prospecto', 'seguimiento'],
        callDisposition: 'interesado',
        callCategory: 'ventas',
        callPriority: 'medium',
        callSource: 'crm',
        callCampaign: 'ventas_2024',
      },
      createdAt: new Date('2024-11-22T11:00:00'),
      updatedAt: new Date('2024-11-22T11:12:00'),
    },
    {
      id: 'call_3',
      sid: 'CA3456789012cdef1234567890abcdef',
      direction: 'inbound',
      from: '+525512345680',
      to: '+525598765432',
      fromName: 'Carlos Rodríguez',
      toName: 'Soporte Técnico',
      startTime: new Date('2024-11-22T11:30:00'),
      endTime: new Date('2024-11-22T11:35:00'),
      duration: 300, // 5 minutos
      status: 'no-answer',
      queueId: 'queue_1',
      queueName: 'Soporte',
      agentId: undefined,
      agentName: undefined,
      contactId: 'contact_3',
      contactName: 'Carlos Rodríguez',
      companyId: 'company_3',
      companyName: 'Empresa DEF',
      recordingStatus: 'recording',
      transcriptStatus: 'failed',
      sentiment: 'negative',
      dispositions: ['no-contestado'],
      tags: ['soporte', 'perdida'],
      talkTime: 0,
      holdTime: 300,
      silenceTime: 0,
      acwTime: 0,
      cost: 0.05,
      currency: 'USD',
      metadata: {
        callerId: '+525512345680',
        callerName: 'Carlos Rodríguez',
        callerLocation: 'Guadalajara',
        callerTimezone: 'America/Mexico_City',
        callerLanguage: 'es',
        callerType: 'customer',
        callerSegment: 'standard',
        callReason: 'Soporte técnico',
        callOutcome: 'No contestado',
        callNotes: 'Llamada perdida, cliente en cola',
        callTags: ['soporte', 'perdida'],
        callDisposition: 'no-contestado',
        callCategory: 'soporte',
        callPriority: 'high',
        callSource: 'web',
        callCampaign: 'soporte_2024',
      },
      createdAt: new Date('2024-11-22T11:30:00'),
      updatedAt: new Date('2024-11-22T11:35:00'),
    }
  ];

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const matchesSearch = !searchQuery || 
        call.fromName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.toName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDirection = !filters.direction || filters.direction.includes(call.direction);
      const matchesStatus = !filters.status || filters.status.includes(call.status);
      const matchesQueue = !filters.queueId || filters.queueId.includes(call.queueId || '');
      const matchesAgent = !filters.agentId || filters.agentId.includes(call.agentId || '');
      
      return matchesSearch && matchesDirection && matchesStatus && matchesQueue && matchesAgent;
    });
  }, [calls, searchQuery, filters]);

  const getDirectionIcon = (direction: CallDirection) => {
    switch (direction) {
      case 'inbound':
        return <PhoneIncoming className="h-4 w-4 text-green-600" />;
      case 'outbound':
        return <PhoneOutgoing className="h-4 w-4 text-blue-600" />;
      default:
        return <Phone className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: CallStatus) => {
    switch (status) {
      case 'completed':
        return <Phone className="h-4 w-4 text-green-600" />;
      case 'no-answer':
        return <PhoneMissed className="h-4 w-4 text-red-600" />;
      case 'busy':
        return <PhoneMissed className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <PhoneMissed className="h-4 w-4 text-red-600" />;
      case 'ringing':
        return <Phone className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'in-progress':
        return <Phone className="h-4 w-4 text-green-600 animate-pulse" />;
      default:
        return <Phone className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'no-answer':
        return 'bg-red-100 text-red-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'ringing':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: CallStatus) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'no-answer':
        return 'No contestada';
      case 'busy':
        return 'Ocupado';
      case 'failed':
        return 'Fallida';
      case 'ringing':
        return 'Sonando';
      case 'in-progress':
        return 'En curso';
      case 'canceled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar llamadas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={filters.direction?.[0] || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value ? [e.target.value as CallDirection] : undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las direcciones</option>
                <option value="inbound">Entrantes</option>
                <option value="outbound">Salientes</option>
              </select>
              
              <select
                value={filters.status?.[0] || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value ? [e.target.value as CallStatus] : undefined }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="completed">Completadas</option>
                <option value="no-answer">No contestadas</option>
                <option value="busy">Ocupado</option>
                <option value="failed">Fallidas</option>
                <option value="ringing">Sonando</option>
                <option value="in-progress">En curso</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>

            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filteredCalls.length} llamadas encontradas</span>
          {selectedCalls.length > 0 && (
            <span>{selectedCalls.length} seleccionadas</span>
          )}
        </div>
      </div>

      {/* Lista de llamadas */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCalls(filteredCalls.map(call => call.id));
                        } else {
                          setSelectedCalls([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto/Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transcripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resumen IA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etiquetas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grabación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCalls.includes(call.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCalls(prev => [...prev, call.id]);
                          } else {
                            setSelectedCalls(prev => prev.filter(id => id !== call.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getDirectionIcon(call.direction)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {call.direction === 'inbound' ? call.fromName : call.toName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {call.direction === 'inbound' ? call.from : call.to}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{call.contactName}</div>
                        <div className="text-sm text-gray-500">{call.companyName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{call.agentName || 'Sin asignar'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{formatDuration(call.duration || 0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(call.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(call.status)}`}>
                          {getStatusText(call.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {call.transcriptStatus === 'completed' ? (
                          <FileText className="h-4 w-4 text-green-600" />
                        ) : call.transcriptStatus === 'in-progress' ? (
                          <FileText className="h-4 w-4 text-blue-600 animate-pulse" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {call.summaryId ? (
                          <MessageSquare className="h-4 w-4 text-green-600" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {call.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {tag}
                          </span>
                        ))}
                        {call.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{call.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {call.qaScore ? (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-900">{call.qaScore}/5</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sin evaluar</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {call.recordingUrl ? (
                          <button
                            onClick={() => setPlayingCall(playingCall === call.id ? null : call.id)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            {playingCall === call.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">Sin grabación</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Editar">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900" title="Copiar">
                          <Copy className="h-4 w-4" />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getDirectionIcon(call.direction)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {call.direction === 'inbound' ? call.fromName : call.toName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {call.direction === 'inbound' ? call.from : call.to}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(call.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(call.status)}`}>
                    {getStatusText(call.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contacto</span>
                  <span className="text-sm font-medium text-gray-900">{call.contactName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Empresa</span>
                  <span className="text-sm font-medium text-gray-900">{call.companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Agente</span>
                  <span className="text-sm font-medium text-gray-900">{call.agentName || 'Sin asignar'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duración</span>
                  <span className="text-sm font-medium text-gray-900">{formatDuration(call.duration || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sentimiento</span>
                  <div className="flex items-center space-x-1">
                    {getSentimentIcon(call.sentiment)}
                    <span className={`text-sm font-medium ${getSentimentColor(call.sentiment)}`}>
                      {call.sentiment || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">QA Score</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">{call.qaScore || 'N/A'}/5</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{formatDate(call.startTime)} {formatTime(call.startTime)}</span>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
