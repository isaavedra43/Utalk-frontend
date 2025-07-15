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

interface ExecutiveDashboardProps {
  className?: string;
}

export function ExecutiveDashboard({ className }: ExecutiveDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  // Hooks para datos reales
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useDashboardMetrics({ period: selectedPeriod });

  const { 
    data: alerts, 
    isLoading: isAlertsLoading 
  } = useDashboardAlerts();

  const { 
    data: realtimeActivity, 
    isLoading: isActivityLoading 
  } = useRealtimeActivity();

  const exportReportMutation = useExportDashboardReport();

  // Auto-refresh countdown
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          refetchDashboard();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refetchDashboard]);

  const handleManualRefresh = () => {
    refetchDashboard();
    setRefreshCountdown(30);
    toast({
      title: "Dashboard actualizado",
      description: "Los datos han sido refrescados exitosamente.",
    });
  };

  const handleExportReport = async (type: 'pdf' | 'excel' | 'csv') => {
    try {
      await exportReportMutation.mutateAsync({
        type,
        period: selectedPeriod,
        sections: ['kpis', 'alerts', 'activity', 'trends'],
      });
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  // Loading state
  if (isDashboardLoading) {
    return (
      <div className={cn("h-full bg-gray-950 text-white p-6", className)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <div className={cn("h-full bg-gray-950 text-white p-6 flex items-center justify-center", className)}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar el dashboard</h3>
          <p className="text-gray-400 mb-4">No se pudieron obtener los datos del dashboard</p>
          <Button onClick={handleManualRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full bg-gray-950 text-white overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Ejecutivo</h1>
            <p className="text-gray-400 text-sm">
              Última actualización: {new Date().toLocaleTimeString()} • 
              Auto-refresh en {refreshCountdown}s
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
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
              onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
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
              className="h-10"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isDashboardLoading && "animate-spin")} />
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
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Ventas Totales"
              value={dashboardData?.totalSales?.value || 0}
              change={dashboardData?.totalSales?.change || 0}
              isPositive={dashboardData?.totalSales?.isPositive || false}
              icon={DollarSign}
              format="currency"
            />
            <KPICard
              title="Pedidos"
              value={dashboardData?.totalOrders?.value || 0}
              change={dashboardData?.totalOrders?.change || 0}
              isPositive={dashboardData?.totalOrders?.isPositive || false}
              icon={ShoppingCart}
            />
            <KPICard
              title="Clientes"
              value={dashboardData?.totalCustomers?.value || 0}
              change={dashboardData?.totalCustomers?.change || 0}
              isPositive={dashboardData?.totalCustomers?.isPositive || false}
              icon={Users}
            />
            <KPICard
              title="Mensajes"
              value={dashboardData?.totalMessages?.value || 0}
              change={dashboardData?.totalMessages?.change || 0}
              isPositive={dashboardData?.totalMessages?.isPositive || false}
              icon={MessageSquare}
            />
          </div>

          {/* Charts and Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencia de Ventas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.salesTrend ? (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-400">Gráfico de tendencias</p>
                    {/* TODO: Implementar gráfico real con recharts */}
                  </div>
                ) : (
                  <Skeleton className="h-48" />
                )}
              </CardContent>
            </Card>

            {/* Messages Activity */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Actividad de Mensajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.messagesTrend ? (
                  <div className="h-48 flex items-center justify-center">
                    <p className="text-gray-400">Gráfico de mensajes</p>
                    {/* TODO: Implementar gráfico real con recharts */}
                  </div>
                ) : (
                  <Skeleton className="h-48" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Alerts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alerts */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas
                  </div>
                  {alerts && alerts.length > 0 && (
                    <Badge variant="destructive">{alerts.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAlertsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : alerts && alerts.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {alerts.slice(0, 5).map((alert) => (
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

            {/* Realtime Activity */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Actividad en Tiempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isActivityLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : realtimeActivity && realtimeActivity.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {realtimeActivity.slice(0, 8).map((activity) => (
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

          {/* Performance Metrics */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricItem 
                  label="Tasa de Conversión" 
                  value={`${dashboardData?.conversionRate || 0}%`}
                  icon={Target}
                />
                <MetricItem 
                  label="Valor Promedio de Orden" 
                  value={`$${dashboardData?.averageOrderValue?.toLocaleString() || 0}`}
                  icon={DollarSign}
                />
                <MetricItem 
                  label="Satisfacción del Cliente" 
                  value={`${dashboardData?.customerSatisfaction || 0}/5`}
                  icon={Star}
                />
                <MetricItem 
                  label="Tiempo de Respuesta" 
                  value={`${dashboardData?.responseTime || 0}min`}
                  icon={Clock}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

// Componente KPI Card
interface KPICardProps {
  title: string;
  value: number;
  change: number;
  isPositive: boolean;
  icon: React.ElementType;
  format?: 'number' | 'currency' | 'percentage';
}

function KPICard({ title, value, change, isPositive, icon: Icon, format = 'number' }: KPICardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
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
                {change > 0 ? '+' : ''}{change}%
              </span>
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

// Componente Metric Item
interface MetricItemProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

function MetricItem({ label, value, icon: Icon }: MetricItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
      <Icon className="h-5 w-5 text-blue-400 flex-shrink-0" />
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-semibold">{value}</p>
      </div>
    </div>
  );
}
