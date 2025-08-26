import React from 'react';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Building, 
  DollarSign, 
  TrendingUp, 
  Tag,
  Calendar,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import type { Client } from '../../../../types/client';

interface ClientProfileTabProps {
  client: Client;
  onUpdate: (updates: Partial<Client>) => void;
}

export const ClientProfileTab: React.FC<ClientProfileTabProps> = ({
  client
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
        year: 'numeric'
      }).format(dateObj);
    } catch {
      return 'Error en fecha';
    }
  };



  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'facebook':
        return <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">f</div>;
      case 'linkedin':
        return <div className="w-4 h-4 bg-blue-700 rounded-sm flex items-center justify-center text-white text-xs font-bold">in</div>;
      case 'website':
        return <div className="w-4 h-4 bg-gray-600 rounded-sm flex items-center justify-center text-white text-xs font-bold">W</div>;
      default:
        return <MapPin className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'startup':
        return <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">S</div>;
      case 'enterprise':
        return <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">E</div>;
      case 'smb':
        return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs font-bold">S</div>;
      default:
        return <Building className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Información de contacto */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Información de contacto
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <span className="text-sm text-gray-600">{client.email}</span>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Copiar
            </button>
          </div>
          {client.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-600">{client.phone}</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Llamar
              </button>
            </div>
          )}
          {client.whatsapp && (
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-600">WhatsApp disponible</span>
              </div>
              <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                Chatear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detalles comerciales */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-4 w-4 mr-2" />
          Detalles comerciales
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Valor esperado:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(client.expectedValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Probabilidad:</span>
              <span className="text-sm font-medium text-gray-900">{client.probability}%</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Fuente:</span>
              <div className="flex items-center space-x-2">
                {getSourceIcon(client.source)}
                <span className="text-sm font-medium text-gray-900">{client.source}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Segmento:</span>
              <div className="flex items-center space-x-2">
                {getSegmentIcon(client.segment)}
                <span className="text-sm font-medium text-gray-900">{client.segment}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Etiquetas */}
      {client.tags.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Etiquetas
          </h4>
          <div className="flex flex-wrap gap-2">
            {client.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Próxima mejor acción */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Próxima mejor acción
          </h4>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">IA</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Envía un caso de éxito similar para acelerar la decisión. El cliente muestra interés pero necesita validación.
        </p>
        <div className="space-y-2">
          <button className="w-full text-left p-3 text-sm bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            Compartir caso de éxito de empresa similar
          </button>
          <button className="w-full text-left p-3 text-sm bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            Agendar demo personalizada
          </button>
          <button className="w-full text-left p-3 text-sm bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            Enviar ROI calculator
          </button>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Resumen ejecutivo
        </h4>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            Cliente enterprise con alto potencial. Ha participado en 2 demos y solicitó propuesta. 
            Principales intereses: integración con sistemas existentes y ROI. Sin objeciones importantes identificadas.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            <div>
              <span className="text-xs text-gray-500">Demos realizadas:</span>
              <p className="text-sm font-medium text-gray-900">2</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Último contacto:</span>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(client.lastContact || client.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Información adicional
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500">Cliente desde:</span>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(client.createdAt)}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Última actualización:</span>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(client.updatedAt)}
            </p>
          </div>
          {client.assignedTo && (
            <div>
              <span className="text-xs text-gray-500">Asignado a:</span>
              <p className="text-sm font-medium text-gray-900">
                {client.assignedToName || client.assignedTo}
              </p>
            </div>
          )}
          {client.nextContact && (
            <div>
              <span className="text-xs text-gray-500">Próximo contacto:</span>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(client.nextContact)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 