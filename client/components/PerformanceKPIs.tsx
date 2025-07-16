import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Star,
  Brain,
  Calendar,
  Phone,
  RefreshCw,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessagingMetrics, useDashboardAlerts } from "@/hooks/useDashboard";

interface PerformanceKPIsProps {
  className?: string;
  data?: {
    totalContacts: number;
    newLeads: number;
    hotLeads: number;
    customers: number;
  };
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "green":
      return "text-green-400";
    case "warning":
      return "text-yellow-400";
    case "danger":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

const getMetricStatus = (value: number, target: number) => {
  const percentage = (value / target) * 100;
  if (percentage >= 90) return "green";
  if (percentage >= 70) return "warning";
  return "danger";
};

export function PerformanceKPIs({ 
  className, 
  data, 
  isLoading = false 
}: PerformanceKPIsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks para datos reales
  const { 
    data: messagingMetrics, 
    isLoading: isLoadingMetrics,
    refetch: refetchMetrics 
  } = useMessagingMetrics();

  const { 
    data: alerts, 
    isLoading: isLoadingAlerts 
  } = useDashboardAlerts();

  // Calcular métricas reales
  const realKPIs = messagingMetrics ? {
    avgResponseTime: `${Math.floor(messagingMetrics.averageResponseTime / 60)}:${(messagingMetrics.averageResponseTime % 60).toString().padStart(2, '0')}`,
    responseTimeStatus: getMetricStatus(messagingMetrics.averageResponseTime, 300), // 5 min target
    closedChatsPercentage: Math.round(messagingMetrics.resolutionRate * 100),
    conversionRate: Math.round((messagingMetrics.totalMessages / Math.max(messagingMetrics.totalConversations, 1)) * 100) / 100,
    inactiveClients: messagingMetrics.pendingChats,
    ticketValue: 2850, // Esto vendría de sales metrics
    satisfactionScore: 4.6, // Esto vendría de customer metrics
    urgentNotifications: alerts?.filter(a => a.priority === 'high').length || 0,
    notifications: alerts?.slice(0, 3) || [],
  } : {
    avgResponseTime: "--:--",
    responseTimeStatus: "green",
    closedChatsPercentage: 0,
    conversionRate: 0,
    inactiveClients: 0,
    ticketValue: 0,
    satisfactionScore: 0,
    urgentNotifications: 0,
    notifications: [],
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchMetrics().finally(() => {
      setIsRefreshing(false);
    });
  };

  const isLoadingData = isLoading || isLoadingMetrics || isLoadingAlerts;

  if (isLoadingData) {
    return (
      <div className={cn("bg-gray-800 rounded-lg p-6", className)}>
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-400">Cargando métricas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("w-80 bg-gray-900 border-r border-gray-800 flex flex-col", className)}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Performance KPIs</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
          
          {/* Contact Stats from props */}
          {data && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-400">Total</div>
                <div className="text-white font-semibold">{data.totalContacts}</div>
              </div>
              <div className="bg-blue-900/30 p-3 rounded-lg">
                <div className="text-blue-400">New Leads</div>
                <div className="text-white font-semibold">{data.newLeads}</div>
              </div>
              <div className="bg-red-900/30 p-3 rounded-lg">
                <div className="text-red-400">Hot Leads</div>
                <div className="text-white font-semibold">{data.hotLeads}</div>
              </div>
              <div className="bg-green-900/30 p-3 rounded-lg">
                <div className="text-green-400">Customers</div>
                <div className="text-white font-semibold">{data.customers}</div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            Auto-refresh en {30}s
          </div>
        </div>

        {/* KPI Metrics */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Response Time */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">
                    Tiempo Promedio de Respuesta
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Últimas 24h</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-lg">
                  {realKPIs.responseTimeStatus === "green" ? "🟢" : realKPIs.responseTimeStatus === "warning" ? "🟡" : "🔴"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", getStatusColor(realKPIs.responseTimeStatus))}>
                  {realKPIs.avgResponseTime}
                </span>
                <span className="text-xs text-gray-400">min:seg</span>
              </div>
            </div>

            {/* Closed Chats */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">Chats Cerrados</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>% de conversaciones resueltas vs iniciadas</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-400">
                  {realKPIs.closedChatsPercentage}%
                </span>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Tasa de Conversión</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>% de leads convertidos en ventas (última semana)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-400">
                  {realKPIs.conversionRate}%
                </span>
              </div>
            </div>

            {/* Inactive Clients */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Clientes Inactivos</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sin respuesta en &gt; 48h</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-yellow-400">
                  {realKPIs.inactiveClients}
                </span>
              </div>
            </div>

            {/* Ticket Value */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">Ticket Promedio</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ticket medio mensual</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-400">
                  ${realKPIs.ticketValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Satisfaction */}
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Satisfacción</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>★ promedio tras cierre de chat</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-yellow-400">
                  {realKPIs.satisfactionScore}
                </span>
                <span className="text-xs text-gray-400">/5.0</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Notifications */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Notificaciones</h3>
            <Badge variant="secondary" className="bg-red-900 text-red-300">
              {realKPIs.urgentNotifications}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {realKPIs.notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-gray-800 p-2 rounded text-xs border-l-2 border-l-blue-500"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {notification.title}
                    </p>
                    <p className="text-gray-400 mt-1">
                      {notification.description}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
              Ver todas las notificaciones
            </Button>
          </div>
        </div>

        {/* Traffic Pattern */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Patrón de Tráfico</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Picos de tráfico por hora (0-23h)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-end gap-1 h-12">
            {Array.from({ length: 24 }, (_, i) => {
              const height = Math.random() * 100;
              return (
                <div
                  key={i}
                  className="bg-purple-500 opacity-70 flex-1 rounded-sm"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>00h</span>
            <span>12h</span>
            <span>23h</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
