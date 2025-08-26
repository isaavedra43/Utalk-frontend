import React from 'react';
import { 
  MessageCircle, 
  Phone, 
  Calendar, 
  Clock, 
  Mail,
  Video,
  FileText,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import type { Client } from '../../../../types/client';

interface Activity {
  id: string;
  type: 'whatsapp' | 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'note';
  title: string;
  description: string;
  date: Date;
  duration?: number;
  status: 'completed' | 'pending' | 'cancelled';
  agent?: string;
}

interface ClientActivityTabProps {
  client: Client;
  activities?: Activity[];
}

export const ClientActivityTab: React.FC<ClientActivityTabProps> = ({
  activities = []
}) => {
  // Mock activities basadas en las imágenes
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'whatsapp',
      title: 'Mensaje WhatsApp',
      description: 'Cliente pregunta sobre tiempo de implementación',
      date: new Date('2025-08-12T17:06:30'),
      status: 'completed'
    },
    {
      id: '2',
      type: 'call',
      title: 'Llamada comercial',
      description: 'Demo del producto - 45 minutos. Cliente muy interesado.',
      date: new Date('2025-08-11T19:06:30'),
      duration: 45,
      status: 'completed'
    },
    {
      id: '3',
      type: 'demo',
      title: 'Demo técnica',
      description: 'Presentación de funcionalidades avanzadas. Cliente solicitó propuesta.',
      date: new Date('2025-08-10T15:30:00'),
      duration: 60,
      status: 'completed'
    },
    {
      id: '4',
      type: 'email',
      title: 'Propuesta enviada',
      description: 'Propuesta comercial enviada por email. Valor: $450,000',
      date: new Date('2025-08-09T10:15:00'),
      status: 'completed'
    },
    {
      id: '5',
      type: 'meeting',
      title: 'Reunión inicial',
      description: 'Primer contacto. Cliente interesado en soluciones CRM.',
      date: new Date('2025-08-05T14:00:00'),
      duration: 30,
      status: 'completed'
    }
  ];

  const allActivities = activities.length > 0 ? activities : mockActivities;

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) {
      return 'Sin fecha';
    }
    
    try {
      const dateObj = new Date(date);
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch {
      return 'Error en fecha';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    
    return formatDate(date);
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-purple-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'demo':
        return <Video className="h-4 w-4 text-indigo-500" />;
      case 'proposal':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'note':
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Info className="h-3 w-3 text-gray-400" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'whatsapp':
        return 'bg-green-50 border-green-200';
      case 'call':
        return 'bg-blue-50 border-blue-200';
      case 'email':
        return 'bg-purple-50 border-purple-200';
      case 'meeting':
        return 'bg-orange-50 border-orange-200';
      case 'demo':
        return 'bg-indigo-50 border-indigo-200';
      case 'proposal':
        return 'bg-red-50 border-red-200';
      case 'note':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">Actividad reciente</h4>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Ver todas
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{allActivities.length}</div>
            <div className="text-xs text-gray-500">Total actividades</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {allActivities.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">Completadas</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {allActivities.filter(a => a.type === 'call').length}
            </div>
            <div className="text-xs text-gray-500">Llamadas</div>
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="space-y-3">
        {allActivities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start space-x-3 p-4 rounded-lg border ${getActivityColor(activity.type)}`}
          >
            {/* Icono de actividad */}
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>

            {/* Contenido de la actividad */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900 mb-1">
                    {activity.title}
                  </h5>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.description}
                  </p>
                  
                  {/* Metadatos */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(activity.date)}</span>
                    </div>
                    {activity.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.duration} min</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(activity.status)}
                      <span className="capitalize">{activity.status}</span>
                    </div>
                  </div>
                </div>

                {/* Tiempo transcurrido */}
                <div className="text-xs text-gray-400 ml-2">
                  {formatTimeAgo(activity.date)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar nueva actividad */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Agregar actividad</span>
        </button>
      </div>

      {/* Filtros de actividad */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Filtrar por tipo</h5>
        <div className="flex flex-wrap gap-2">
          {['Todas', 'Llamadas', 'Emails', 'Demos', 'Reuniones', 'WhatsApp'].map((filter) => (
            <button
              key={filter}
              className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente Plus para el botón
const Plus: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
); 