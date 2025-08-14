import React from 'react';
import { 
  Clock, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users,
  RefreshCw
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'red' | 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, loading = false }) => {
  const colorClasses = {
    red: 'border-red-200 bg-red-50 text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700'
  };

  const iconColorClasses = {
    red: 'text-red-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500'
  };

  return (
    <div className={`flex items-center p-4 rounded-lg border ${colorClasses[color]} transition-all duration-200 hover:shadow-sm`}>
      <div className={`p-2 rounded-lg bg-white ${iconColorClasses[color]} mr-3`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium opacity-80">
          {title}
        </div>
        <div className="text-lg font-bold">
          {loading ? (
            <div className="flex items-center">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Cargando...
            </div>
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );
};

interface ClientKPIsProps {
  kpis: {
    contactsToContactToday: number;
    totalOpportunities: number;
    formattedTotalValue: string;
    formattedWinRate: string;
    formattedAverageDays: string;
    formattedProjectedRevenue: string;
  };
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const ClientKPIs: React.FC<ClientKPIsProps> = ({
  kpis,
  loading = false,
  error,
  onRefresh
}) => {
  const kpiData = [
    {
      title: 'por contactar hoy',
      value: `${kpis.contactsToContactToday}`,
      icon: <Clock className="h-5 w-5" />,
      color: 'red' as const
    },
    {
      title: 'oportunidades',
      value: `${kpis.totalOpportunities}`,
      icon: <Target className="h-5 w-5" />,
      color: 'blue' as const
    },
    {
      title: 'pipeline',
      value: kpis.formattedTotalValue,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'green' as const
    },
    {
      title: 'win rate',
      value: kpis.formattedWinRate,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'purple' as const
    },
    {
      title: 'promedio',
      value: kpis.formattedAverageDays,
      icon: <Calendar className="h-5 w-5" />,
      color: 'orange' as const
    },
    {
      title: 'proyectado',
      value: kpis.formattedProjectedRevenue,
      icon: <Users className="h-5 w-5" />,
      color: 'green' as const
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header de KPIs */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Métricas Clave
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar métricas
              </h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            loading={loading}
          />
        ))}
      </div>

      {/* Estado de carga general */}
      {loading && !error && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-gray-600">Cargando métricas...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 