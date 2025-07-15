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

// Mock data fallback - will be replaced with real data
const mockKPIs = {
  avgResponseTime: "02:15", // mm:ss
  responseTimeStatus: "warning", // green, warning, danger
  closedChatsPercentage: 87,
  conversionRate: 23.5,
  inactiveClients: 12,
  ticketValue: 2850,
  satisfactionScore: 4.6,
  urgentNotifications: 3,
  notifications: [
    {
      id: "1",
      type: "warning" as const,
      title: "Chat sin respuesta",
      description: "Cliente esperando > 15 min",
      timestamp: "hace 5 min",
      isUnread: true,
    },
    {
      id: "2", 
      type: "info" as const,
      title: "Nuevo lead calificado",
      description: "Score IA: 92/100",
      timestamp: "hace 12 min",
      isUnread: true,
    },
    {
      id: "3",
      type: "success" as const,
      title: "Venta cerrada",
      description: "$4,200 - Lead convertido",
      timestamp: "hace 25 min",
      isUnread: false,
    },
  ],
};

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

const getStatusEmoji = (status: string) => {
  switch (status) {
    case "green":
      return "🟢";
    case "warning":
      return "🟡";
    case "danger":
      return "🔴";
    default:
      return "⚪";
  }
};

export function PerformanceKPIs({ className, data, isLoading }: PerformanceKPIsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);

  // Auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto refresh trigger - replace with real data fetch
          setIsRefreshing(true);
          setTimeout(() => {
            setIsRefreshing(false);
          }, 1500);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setCountdown(30);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-6", className)}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Cargando KPIs...</p>
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
              onClick={handleManualRefresh}
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
            Auto-refresh en {countdown}s
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
                  {getStatusEmoji(mockKPIs.responseTimeStatus)}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-2xl font-bold", getStatusColor(mockKPIs.responseTimeStatus))}>
                  {mockKPIs.avgResponseTime}
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
                  {mockKPIs.closedChatsPercentage}%
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
                  {mockKPIs.conversionRate}%
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
                  {mockKPIs.inactiveClients}
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
                  ${mockKPIs.ticketValue.toLocaleString()}
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
                  {mockKPIs.satisfactionScore}
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
              {mockKPIs.urgentNotifications}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {mockKPIs.notifications.slice(0, 3).map((notification) => (
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
                  {notification.isUnread && (
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
