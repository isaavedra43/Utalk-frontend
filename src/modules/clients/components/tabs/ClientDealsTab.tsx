import React from 'react';
import { Calendar } from 'lucide-react';
import type { Client } from '../../../../types/client';

interface Deal {
  id: string;
  title: string;
  value: number;
  probability: number;
  closeDate: Date;
  stage: 'lead' | 'prospect' | 'demo' | 'proposal' | 'negotiation' | 'won' | 'lost';
  description: string;
  tags: string[];
  assignedTo?: string;
  lastActivity?: Date;
}

interface ClientDealsTabProps {
  client: Client;
  deals?: Deal[];
}

export const ClientDealsTab: React.FC<ClientDealsTabProps> = ({
  deals = []
}) => {
  // Mock deals basadas en las imágenes
  const mockDeals: Deal[] = [
    {
      id: '1',
      title: 'Implementación CRM Enterprise',
      value: 450000,
      probability: 75,
      closeDate: new Date('2025-08-27'),
      stage: 'negotiation',
      description: 'Implementación completa del sistema CRM para empresa enterprise con 500+ usuarios.',
      tags: ['Enterprise', 'CRM', 'Implementación']
    },
    {
      id: '2',
      title: 'Módulo Analytics Avanzado',
      value: 125000,
      probability: 60,
      closeDate: new Date('2025-09-15'),
      stage: 'proposal',
      description: 'Módulo de análisis predictivo y reportes avanzados.',
      tags: ['Analytics', 'Predictivo']
    },
    {
      id: '3',
      title: 'Soporte Premium Anual',
      value: 75000,
      probability: 90,
      closeDate: new Date('2025-12-31'),
      stage: 'won',
      description: 'Contrato de soporte premium con SLA garantizado.',
      tags: ['Soporte', 'Premium']
    }
  ];

  const allDeals = deals.length > 0 ? deals : mockDeals;

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
    } catch (error) {
      return 'Error en fecha';
    }
  };

  const getStageColor = (stage: Deal['stage']) => {
    switch (stage) {
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'negotiation':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'proposal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'demo':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'lead':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageLabel = (stage: Deal['stage']) => {
    switch (stage) {
      case 'won':
        return 'Ganado';
      case 'lost':
        return 'Perdido';
      case 'negotiation':
        return 'Negociación';
      case 'proposal':
        return 'Propuesta';
      case 'demo':
        return 'Demo';
      case 'prospect':
        return 'Prospecto';
      case 'lead':
        return 'Lead';
      default:
        return stage;
    }
  };

  const getDaysUntilClose = (closeDate: Date) => {
    const now = new Date();
    const diffTime = closeDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    return `${diffDays} días`;
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    if (probability >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const totalValue = allDeals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedValue = allDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);

  return (
    <div className="space-y-4">
      {/* Resumen de deals */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Resumen de oportunidades</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{allDeals.length}</div>
            <div className="text-xs text-gray-500">Total deals</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-gray-500">Valor total</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(weightedValue)}
            </div>
            <div className="text-xs text-gray-500">Valor ponderado</div>
          </div>
        </div>
      </div>

      {/* Lista de deals */}
      <div className="space-y-3">
        {allDeals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h5 className="text-sm font-medium text-gray-900 mb-1">
                  {deal.title}
                </h5>
                <p className="text-sm text-gray-600">
                  {deal.description}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageColor(deal.stage)}`}>
                {getStageLabel(deal.stage)}
              </span>
            </div>

            {/* Metadatos del deal */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Valor:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(deal.value)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Probabilidad:</span>
                  <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                    {deal.probability}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Cierre:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(deal.closeDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Tiempo:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getDaysUntilClose(deal.closeDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {deal.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {deal.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Última actividad: {deal.lastActivity ? formatDate(deal.lastActivity) : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                  Ver detalles
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-xs font-medium">
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar nuevo deal */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Crear nueva oportunidad</span>
        </button>
      </div>

      {/* Filtros de deals */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Filtrar por etapa</h5>
        <div className="flex flex-wrap gap-2">
          {['Todas', 'Lead', 'Prospecto', 'Demo', 'Propuesta', 'Negociación', 'Ganado', 'Perdido'].map((filter) => (
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