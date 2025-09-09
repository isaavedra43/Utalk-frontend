import React, { useState } from 'react';
import { Voicemail, Play, Pause, Download, Trash2, Star, Clock, User, Phone, MessageSquare, Tag, MoreHorizontal } from 'lucide-react';

export const VoicemailList: React.FC = () => {
  const [playingVoicemail, setPlayingVoicemail] = useState<string | null>(null);

  // Datos mock para demostración
  const voicemails = [
    {
      id: 'vm_1',
      callId: 'call_1',
      from: '+525512345678',
      to: '+525598765432',
      fromName: 'Juan Pérez',
      toName: 'Soporte Técnico',
      audioUrl: 'https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE123.mp3',
      duration: 120, // 2 minutos
      transcriptId: 'transcript_1',
      transcript: 'Hola, necesito ayuda con mi cuenta. No puedo acceder y necesito que me ayuden urgentemente. Por favor llámenme de vuelta.',
      status: 'new',
      assignedTo: 'agent_1',
      assignedToName: 'Ana García',
      priority: 'high',
      category: 'soporte',
      tags: ['urgente', 'cuenta', 'acceso'],
      notes: 'Cliente muy molesto, requiere atención inmediata',
      isUrgent: true,
      isRead: false,
      readAt: undefined,
      createdAt: new Date('2024-11-22T10:30:00'),
      updatedAt: new Date('2024-11-22T10:30:00'),
    },
    {
      id: 'vm_2',
      callId: 'call_2',
      from: '+525512345679',
      to: '+525598765432',
      fromName: 'María López',
      toName: 'Ventas',
      audioUrl: 'https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE124.mp3',
      duration: 90, // 1.5 minutos
      transcriptId: 'transcript_2',
      transcript: 'Hola, estoy interesada en sus servicios. Me gustaría que me contacten para agendar una cita y conocer más sobre sus productos.',
      status: 'new',
      assignedTo: 'agent_2',
      assignedToName: 'Carlos Rodríguez',
      priority: 'medium',
      category: 'ventas',
      tags: ['interesado', 'cita', 'productos'],
      notes: 'Prospecto caliente, muy interesada',
      isUrgent: false,
      isRead: false,
      readAt: undefined,
      createdAt: new Date('2024-11-22T11:00:00'),
      updatedAt: new Date('2024-11-22T11:00:00'),
    },
    {
      id: 'vm_3',
      callId: 'call_3',
      from: '+525512345680',
      to: '+525598765432',
      fromName: 'Roberto Díaz',
      toName: 'Soporte Técnico',
      audioUrl: 'https://api.twilio.com/2010-04-01/Accounts/AC123/Recordings/RE125.mp3',
      duration: 60, // 1 minuto
      transcriptId: 'transcript_3',
      transcript: 'Tengo un problema con la facturación. La factura que recibí no coincide con lo que acordamos. Necesito que revisen esto.',
      status: 'listened',
      assignedTo: 'agent_1',
      assignedToName: 'Ana García',
      priority: 'medium',
      category: 'facturacion',
      tags: ['factura', 'discrepancia', 'revision'],
      notes: 'Problema de facturación, revisar con contabilidad',
      isUrgent: false,
      isRead: true,
      readAt: new Date('2024-11-22T12:00:00'),
      createdAt: new Date('2024-11-22T11:30:00'),
      updatedAt: new Date('2024-11-22T12:00:00'),
    }
  ];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'listened':
        return 'bg-green-100 text-green-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Nuevo';
      case 'listened':
        return 'Escuchado';
      case 'deleted':
        return 'Eliminado';
      case 'assigned':
        return 'Asignado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mensajes de Voz</h2>
          <p className="text-gray-600">Gestiona los mensajes de voz recibidos</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mensajes</p>
              <p className="text-2xl font-bold text-gray-900">{voicemails.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Voicemail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nuevos</p>
              <p className="text-2xl font-bold text-gray-900">
                {voicemails.filter(vm => vm.status === 'new').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {voicemails.filter(vm => vm.isUrgent).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Escuchados</p>
              <p className="text-2xl font-bold text-gray-900">
                {voicemails.filter(vm => vm.status === 'listened').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de mensajes */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  De
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transcripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignado a
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voicemails.map((voicemail) => (
                <tr key={voicemail.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        voicemail.isRead ? 'bg-gray-400' : 'bg-blue-500'
                      }`}></div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(voicemail.status)}`}>
                        {getStatusText(voicemail.status)}
                      </span>
                      {voicemail.isUrgent && (
                        <Star className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{voicemail.fromName}</div>
                      <div className="text-sm text-gray-500">{voicemail.from}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{formatDuration(voicemail.duration)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">{voicemail.transcript}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(voicemail.priority)}`}>
                      {voicemail.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{voicemail.assignedToName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{formatDate(voicemail.createdAt)}</div>
                      <div className="text-sm text-gray-500">{formatTime(voicemail.createdAt)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPlayingVoicemail(playingVoicemail === voicemail.id ? null : voicemail.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reproducir/Pausar"
                      >
                        {playingVoicemail === voicemail.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Descargar">
                        <Download className="h-4 w-4" />
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
