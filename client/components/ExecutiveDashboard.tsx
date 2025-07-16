import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  Phone,
  Target,
  BarChart3,
  Eye,
  Search,
  Filter,
  Download,
  Share2,
  Menu,
  X,
  FileText,
  Star,
  ShoppingCart,
  UserCheck,
  Zap,
  Calendar,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useDashboardMetrics, 
  useDashboardAlerts, 
  useRealtimeActivity,
  useExportDashboardReport 
} from "@/hooks/useDashboard";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";

interface ExecutiveDashboardProps {
  className?: string;
}

export function ExecutiveDashboard({ className }: ExecutiveDashboardProps) {
  // 🚀 LOGS AVANZADOS DE MONTAJE DEL COMPONENTE
  const componentStartTime = performance.now();
  const componentId = `dashboard-exec-${Date.now()}`;
  
  console.group('🏗️ [EXECUTIVE DASHBOARD] Componente montándose');
  console.info('📋 Props recibidos:', { 
    className,
    componentId,
    mountTime: new Date().toISOString() 
  });
  console.groupEnd();

  // Estado local del componente
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  console.info('🔧 [COMPONENT STATE] Estado inicial configurado', {
    searchTerm,
    selectedPeriod,
    autoRefreshEnabled,
    refreshCountdown,
    componentId
  });

  // 🎯 HOOKS CON LOGS EXHAUSTIVOS
  console.group('🔌 [HOOKS] Inicializando hooks del dashboard');
  
  const dashboardHookStartTime = performance.now();
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard,
    isFetching: isDashboardFetching
  } = useDashboardMetrics({ 
    period: selectedPeriod,
    includeComparisons: true,
    refresh: false
  });
  
  const dashboardHookEndTime = performance.now();
  console.info('📊 [HOOK] useDashboardMetrics resultado:', {
    hookExecutionTime: `${(dashboardHookEndTime - dashboardHookStartTime).toFixed(2)}ms`,
    hasData: !!dashboardData,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    hasError: !!dashboardError,
    dataKeys: dashboardData ? Object.keys(dashboardData) : [],
    period: selectedPeriod
  });

  const alertsHookStartTime = performance.now();
  const { 
    data: alertsData, 
    isLoading: isAlertsLoading,
    error: alertsError 
  } = useDashboardAlerts();
  
  const alertsHookEndTime = performance.now();
  console.info('🚨 [HOOK] useDashboardAlerts resultado:', {
    hookExecutionTime: `${(alertsHookEndTime - alertsHookStartTime).toFixed(2)}ms`,
    hasData: !!alertsData,
    isLoading: isAlertsLoading,
    hasError: !!alertsError,
    alertsCount: alertsData?.alerts?.length || 0
  });

  const realtimeHookStartTime = performance.now();
  const { 
    data: realtimeData, 
    isLoading: isRealtimeLoading,
    error: realtimeError 
  } = useRealtimeActivity();
  
  const realtimeHookEndTime = performance.now();
  console.info('🔴 [HOOK] useRealtimeActivity resultado:', {
    hookExecutionTime: `${(realtimeHookEndTime - realtimeHookStartTime).toFixed(2)}ms`,
    hasData: !!realtimeData,
    isLoading: isRealtimeLoading,
    hasError: !!realtimeError,
    activitiesCount: realtimeData?.length || 0
  });

  const exportReportMutation = useExportDashboardReport();
  
  console.groupEnd();

  // Log cambios en los datos
  useEffect(() => {
    if (dashboardData) {
      console.info('📈 [DATA CHANGE] Datos del dashboard actualizados', {
        componentId,
        timestamp: new Date().toISOString(),
        dataStructure: {
          totalConversations: dashboardData.totalConversations,
          activeConversations: dashboardData.activeConversations,
          responseTime: dashboardData.responseTime,
          customerSatisfaction: dashboardData.customerSatisfaction,
          hasComparisons: !!dashboardData.comparisons,
          alertsCount: dashboardData.alerts?.length || 0
        }
      });
    }
  }, [dashboardData, componentId]);

  // Log errores de hooks
  useEffect(() => {
    if (dashboardError) {
      console.error('💥 [DASHBOARD ERROR] Error en datos del dashboard', {
        error: dashboardError.message,
        componentId,
        timestamp: new Date().toISOString()
      });
      logger.api('Error crítico en dashboard ejecutivo', { 
        error: dashboardError.message,
        component: 'ExecutiveDashboard'
      }, true);
    }
  }, [dashboardError, componentId]);

  // Auto-refresh countdown con logs
  useEffect(() => {
    if (!autoRefreshEnabled) {
      console.info('⏸️ [AUTO-REFRESH] Auto-refresh deshabilitado');
      return;
    }

    console.info('🔄 [AUTO-REFRESH] Auto-refresh habilitado, countdown cada 30s');

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          console.info('🔄 [AUTO-REFRESH] Ejecutando refresh automático');
          refetchDashboard();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      console.info('🛑 [AUTO-REFRESH] Timer limpiado');
    };
  }, [autoRefreshEnabled, refetchDashboard]);

  // Handlers con logs
  const handleManualRefresh = () => {
    const refreshStartTime = performance.now();
    console.info('🔄 [MANUAL REFRESH] Refresh manual iniciado');
    
    refetchDashboard();
    setRefreshCountdown(30);
    
    const refreshEndTime = performance.now();
    console.info('✅ [MANUAL REFRESH] Refresh manual completado', {
      refreshDuration: `${(refreshEndTime - refreshStartTime).toFixed(2)}ms`
    });
    
    toast({
      title: "Dashboard actualizado",
      description: "Los datos han sido refrescados exitosamente.",
    });
  };

  const handleExportReport = async (type: 'pdf' | 'excel' | 'csv') => {
    const exportStartTime = performance.now();
    console.info('📄 [EXPORT] Iniciando exportación de reporte', { type });
    
    try {
      await exportReportMutation.mutateAsync({
        type,
        period: selectedPeriod,
        sections: ['kpis', 'alerts', 'activity', 'trends'],
      });
      
      const exportEndTime = performance.now();
      console.info('✅ [EXPORT SUCCESS] Reporte exportado exitosamente', {
        type,
        exportDuration: `${(exportEndTime - exportStartTime).toFixed(2)}ms`
      });
    } catch (error: any) {
      const exportEndTime = performance.now();
      console.error('❌ [EXPORT ERROR] Error en exportación', {
        type,
        error: error.message,
        exportDuration: `${(exportEndTime - exportStartTime).toFixed(2)}ms`
      });
    }
  };

  // 🎨 RENDERIZADO CON FEEDBACK VISUAL AVANZADO

  // Loading state con skeleton loader mejorado
  if (isDashboardLoading || isAlertsLoading) {
    console.info('⌛ [RENDER] Mostrando estado de carga');
    
    return (
      <div className={cn("h-full bg-gray-950 text-white p-6", className)}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-gray-800" />
              <Skeleton className="h-4 w-64 bg-gray-800" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 bg-gray-800" />
              <Skeleton className="h-10 w-20 bg-gray-800" />
              <Skeleton className="h-10 w-28 bg-gray-800" />
            </div>
          </div>
          
          {/* KPI Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-gray-800" />
                      <Skeleton className="h-8 w-20 bg-gray-800" />
                      <Skeleton className="h-4 w-16 bg-gray-800" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-lg bg-gray-800" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-gray-800" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 bg-gray-800" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Loading indicator */}
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">Cargando dashboard ejecutivo...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state con acción de recuperación
  if (dashboardError || alertsError || realtimeError) {
    console.error('💀 [RENDER] Mostrando estado de error');
    
    return (
      <div className={cn("h-full bg-gray-950 text-white p-6 flex items-center justify-center", className)}>
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-400 mb-6">
            No se pudieron obtener los datos del dashboard ejecutivo. 
            Verifique su conexión e inténtelo nuevamente.
          </p>
          
          <div className="space-y-3">
            <Button onClick={handleManualRefresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar Carga
            </Button>
            
            <details className="text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                Detalles del error
              </summary>
              <div className="mt-2 p-3 bg-gray-900 rounded text-xs text-red-300">
                {dashboardError?.message || alertsError?.message || realtimeError?.message}
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Log renderizado exitoso
  const componentEndTime = performance.now();
  const totalRenderTime = componentEndTime - componentStartTime;
  
  console.info('🎉 [RENDER SUCCESS] ExecutiveDashboard renderizado exitosamente', {
    totalRenderTime: `${totalRenderTime.toFixed(2)}ms`,
    componentId,
    hasData: !!dashboardData,
    timestamp: new Date().toISOString()
  });

  // Renderizado principal
  return (
    <div className={cn("h-full bg-gray-950 text-white overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Ejecutivo</h1>
            <p className="text-gray-400 text-sm">
              Última actualización: {new Date().toLocaleTimeString()} • 
              {autoRefreshEnabled ? `Auto-refresh en ${refreshCountdown}s` : 'Auto-refresh deshabilitado'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => {
                const newPeriod = e.target.value as any;
                console.info('📅 [PERIOD CHANGE] Período cambiado', { 
                  from: selectedPeriod, 
                  to: newPeriod 
                });
                setSelectedPeriod(newPeriod);
              }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
            </select>

            {/* Auto-refresh toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newState = !autoRefreshEnabled;
                console.info('🔄 [AUTO-REFRESH TOGGLE]', { 
                  from: autoRefreshEnabled, 
                  to: newState 
                });
                setAutoRefreshEnabled(newState);
              }}
              className={cn(
                "h-10",
                autoRefreshEnabled ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
              )}
            >
              <Zap className="h-4 w-4 mr-2" />
              Auto
            </Button>

            {/* Manual refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isDashboardFetching}
              className="h-10"
            >
              <RefreshCw className={cn(
                "h-4 w-4 mr-2", 
                (isDashboardFetching || isDashboardLoading) && "animate-spin"
              )} />
              Actualizar
            </Button>

            {/* Export buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport('pdf')}
                disabled={exportReportMutation.isPending}
                className="h-10"
              >
                {exportReportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport('excel')}
                disabled={exportReportMutation.isPending}
                className="h-10"
              >
                <FileText className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* KPI Cards con datos reales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Conversaciones Totales"
              value={dashboardData?.totalConversations || 0}
              change={dashboardData?.comparisons?.changes?.conversations?.percentage || 0}
              isPositive={dashboardData?.comparisons?.changes?.conversations?.trend === 'up'}
              icon={MessageSquare}
            />
            <KPICard
              title="Conversaciones Activas"
              value={dashboardData?.activeConversations || 0}
              change={5.2} // Mock data
              isPositive={true}
              icon={Users}
            />
            <KPICard
              title="Tiempo de Respuesta"
              value={dashboardData?.responseTime || 0}
              change={dashboardData?.comparisons?.changes?.responseTime?.percentage || 0}
              isPositive={dashboardData?.comparisons?.changes?.responseTime?.trend === 'down'} // Menor es mejor
              icon={Clock}
              format="time"
            />
            <KPICard
              title="Satisfacción"
              value={dashboardData?.customerSatisfaction || 0}
              change={dashboardData?.comparisons?.changes?.satisfaction?.percentage || 0}
              isPositive={dashboardData?.comparisons?.changes?.satisfaction?.trend === 'up'}
              icon={Star}
              format="percentage"
            />
          </div>

          {/* Charts y métricas detalladas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de rendimiento */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias Diarias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.dailyMetrics && dashboardData.dailyMetrics.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.dailyMetrics.slice(-5).map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div>
                          <p className="text-white font-medium">{metric.date}</p>
                          <p className="text-gray-400 text-sm">{metric.conversations} conversaciones</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{metric.avgResponseTime}min respuesta</p>
                          <p className="text-blue-400">{metric.satisfaction}% satisfacción</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-400">No hay datos de tendencias disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Agents */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Agentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.topAgents && dashboardData.topAgents.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.topAgents.slice(0, 5).map((agent, index) => (
                      <div key={agent.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{agent.name}</p>
                          <p className="text-gray-400 text-sm">
                            {agent.conversations} conv • {agent.avgResponseTime}min • {agent.satisfaction}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-400">No hay datos de agentes disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alertas */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas
                  </div>
                  {alertsData?.alerts && alertsData.alerts.length > 0 && (
                    <Badge variant="destructive">{alertsData.alerts.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertsData?.alerts && alertsData.alerts.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {alertsData.alerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-3 rounded-lg border-l-4",
                          alert.type === 'error' && "bg-red-900/20 border-l-red-500",
                          alert.type === 'warning' && "bg-yellow-900/20 border-l-yellow-500",
                          alert.type === 'info' && "bg-blue-900/20 border-l-blue-500",
                          alert.type === 'success' && "bg-green-900/20 border-l-green-500"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                            <p className="text-gray-400 text-xs mt-1">{alert.description}</p>
                            <p className="text-gray-500 text-xs mt-2">{alert.timestamp}</p>
                          </div>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-gray-400">No hay alertas activas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actividad en tiempo real */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Actividad en Tiempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                {realtimeData && realtimeData.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {realtimeData.slice(0, 8).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                        <div className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          activity.type === 'sale' && "bg-green-400",
                          activity.type === 'message' && "bg-blue-400",
                          activity.type === 'customer' && "bg-purple-400",
                          activity.type === 'order' && "bg-yellow-400",
                          activity.type === 'conversation' && "bg-pink-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-500 text-xs">{activity.timestamp}</p>
                            {activity.user && (
                              <p className="text-gray-400 text-xs">• {activity.user}</p>
                            )}
                            {activity.amount && (
                              <p className="text-green-400 text-xs font-medium">
                                ${activity.amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">No hay actividad reciente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Métricas de performance adicionales */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Métricas de Performance del Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricItem 
                  label="Tasa de Conversión" 
                  value={`${dashboardData?.conversionRate || 0}%`}
                  icon={Target}
                />
                <MetricItem 
                  label="Tasa de Resolución" 
                  value={`${dashboardData?.resolutionRate || 0}%`}
                  icon={CheckCircle}
                />
                <MetricItem 
                  label="Eficiencia del Equipo" 
                  value={`${dashboardData?.teamEfficiency || 0}%`}
                  icon={Users}
                />
                <MetricItem 
                  label="Total de Contactos" 
                  value={dashboardData?.totalContacts?.toLocaleString() || '0'}
                  icon={Phone}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

// Componente KPI Card mejorado
interface KPICardProps {
  title: string;
  value: number;
  change: number;
  isPositive: boolean;
  icon: React.ElementType;
  format?: 'number' | 'currency' | 'percentage' | 'time';
}

function KPICard({ title, value, change, isPositive, icon: Icon, format = 'number' }: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      case 'time':
        return `${val}min`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold mt-1">{formatValue(value)}</p>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-green-400" : "text-red-400"
              )}>
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500 text-xs ml-1">vs anterior</span>
            </div>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <Icon className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente Metric Item mejorado
interface MetricItemProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

function MetricItem({ label, value, icon: Icon }: MetricItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
      <Icon className="h-5 w-5 text-blue-400 flex-shrink-0" />
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );
}
