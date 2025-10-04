import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  CreditCard,
  FolderOpen,
  BarChart3,
  Settings,
  FileSpreadsheet,
  AlertTriangle,
  Bell,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';

// Import sub-components (we'll create these next)
import VacationsOverviewTab from './VacationsOverviewTab';
import VacationsRequestsTab from './VacationsRequestsTab';
import VacationsCalendarTab from './VacationsCalendarTab';
import VacationsPaymentsTab from './VacationsPaymentsTab';
import VacationsEvidencesTab from './VacationsEvidencesTab';
import VacationsAnalyticsTab from './VacationsAnalyticsTab';
import VacationsPoliciesTab from './VacationsPoliciesTab';
import VacationsReportsTab from './VacationsReportsTab';
import VacationsAlertsTab from './VacationsAlertsTab';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsManagementViewProps {
  onBack?: () => void;
}

// ============================================================================
// TABS CONFIGURATION
// ============================================================================

const TABS = [
  {
    id: 'overview',
    label: 'Resumen General',
    icon: BarChart3,
    description: 'Vista general del sistema de vacaciones'
  },
  {
    id: 'requests',
    label: 'Solicitudes',
    icon: FileText,
    description: 'Gestión de solicitudes de vacaciones'
  },
  {
    id: 'calendar',
    label: 'Calendario',
    icon: Calendar,
    description: 'Coordinación y planificación de fechas'
  },
  {
    id: 'payments',
    label: 'Pagos',
    icon: CreditCard,
    description: 'Gestión de pagos de vacaciones'
  },
  {
    id: 'evidences',
    label: 'Evidencias',
    icon: FolderOpen,
    description: 'Documentación y comprobantes'
  },
  {
    id: 'analytics',
    label: 'Análisis',
    icon: TrendingUp,
    description: 'Métricas y reportes avanzados'
  },
  {
    id: 'policies',
    label: 'Políticas',
    icon: Settings,
    description: 'Configuración de políticas de vacaciones'
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: FileSpreadsheet,
    description: 'Generación de reportes personalizados'
  },
  {
    id: 'alerts',
    label: 'Alertas',
    icon: Bell,
    description: 'Notificaciones y alertas del sistema'
  }
] as const;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VacationsManagementView: React.FC<VacationsManagementViewProps> = ({
  onBack
}) => {
  const { showSuccess, showError } = useNotifications();

  // Use the vacations management hook
  const {
    navigation,
    setActiveTab,
    dashboard,
    summary,
    requests,
    alerts,
    loading,
    errors,
    refreshAll,
    exportData,
    importData,
    recalculateBalances
  } = useVacationsManagement({
    autoRefresh: true,
    refreshInterval: 60000, // Refresh every minute
    initialTab: 'overview'
  });

  // Local state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleTabChange = (tabId: typeof TABS[number]['id']) => {
    setActiveTab(tabId);
    setShowMobileMenu(false);
  };

  const handleRefresh = async () => {
    try {
      await refreshAll();
      showSuccess('Datos actualizados correctamente');
    } catch (error) {
      showError('Error al actualizar los datos');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportData({
        format: 'excel',
        include: {
          requests: true,
          payments: true,
          evidences: true,
          analytics: true,
          policies: true
        },
        filters: navigation.filters,
        dateRange: navigation.dateRange,
        includeInactive: false
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vacaciones_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess('Datos exportados exitosamente');
    } catch (error) {
      showError('Error al exportar los datos');
    }
  };

  const handleRecalculateBalances = async () => {
    try {
      await recalculateBalances();
      showSuccess('Balances recalculados correctamente');
    } catch (error) {
      showError('Error al recalcular balances');
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getTabBadge = (tabId: string) => {
    switch (tabId) {
      case 'requests':
        const pendingRequests = requests.filter(r => r.status === 'pending').length;
        return pendingRequests > 0 ? pendingRequests.toString() : null;
      case 'alerts':
        const unreadAlerts = alerts.filter(a => !a.isRead).length;
        return unreadAlerts > 0 ? unreadAlerts.toString() : null;
      default:
        return null;
    }
  };

  const getTabIcon = (tabId: string) => {
    const tab = TABS.find(t => t.id === tabId);
    return tab ? tab.icon : BarChart3;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-600 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Vacaciones
                </h1>
                <p className="text-sm text-gray-600">
                  Control total del sistema de vacaciones empresarial
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading.dashboard}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Actualizar datos"
              >
                <RefreshCw className={`h-4 w-4 ${loading.dashboard ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                title="Exportar datos"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Más acciones"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {/* Quick Actions Dropdown */}
              {showQuickActions && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={handleRecalculateBalances}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Recalcular Balances
                  </button>
                  <button
                    onClick={() => showSuccess('Función próximamente')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Configuración Rápida
                  </button>
                  <button
                    onClick={() => showSuccess('Función próximamente')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Vista de Emergencia
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const badge = getTabBadge(tab.id);
                const isActive = navigation.activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {badge && (
                      <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        tab.id === 'alerts'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {navigation.activeTab === 'overview' && (
            <VacationsOverviewTab
              dashboard={dashboard}
              summary={summary}
              alerts={alerts}
              loading={loading}
              errors={errors}
            />
          )}

          {/* Requests Tab */}
          {navigation.activeTab === 'requests' && (
            <VacationsRequestsTab />
          )}

          {/* Calendar Tab */}
          {navigation.activeTab === 'calendar' && (
            <VacationsCalendarTab />
          )}

          {/* Payments Tab */}
          {navigation.activeTab === 'payments' && (
            <VacationsPaymentsTab />
          )}

          {/* Evidences Tab */}
          {navigation.activeTab === 'evidences' && (
            <VacationsEvidencesTab />
          )}

          {/* Analytics Tab */}
          {navigation.activeTab === 'analytics' && (
            <VacationsAnalyticsTab />
          )}

          {/* Policies Tab */}
          {navigation.activeTab === 'policies' && (
            <VacationsPoliciesTab />
          )}

          {/* Reports Tab */}
          {navigation.activeTab === 'reports' && (
            <VacationsReportsTab />
          )}

          {/* Alerts Tab */}
          {navigation.activeTab === 'alerts' && (
            <VacationsAlertsTab />
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading.dashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <div>
                <p className="text-lg font-medium text-gray-900">Cargando datos...</p>
                <p className="text-sm text-gray-600">Actualizando información del sistema</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errors.dashboard && (
        <div className="fixed top-0 left-0 right-0 bg-red-50 border-b border-red-200 p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">{errors.dashboard}</p>
            </div>
            <button
              onClick={() => refreshAll()}
              className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationsManagementView;
