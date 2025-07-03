import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceKPIsProps {
  className?: string;
}

// Mock data - replace with real endpoints
const mockKPIs = {
  avgResponseTime: "02:15", // mm:ss
  responseTimeStatus: "warning", // green, warning, danger
  closedChatsPercentage: 87,
  conversionRate: 23.5,
  inactiveClients: 12,
  avgTicketValue: 1250.75,
  csatScore: 4.2,
  aiSuggestions: [
    "Priorizar cliente María González - 92% conversión",
    "Reasignar chat #1234 a Carlos López",
    "Enviar seguimiento a 3 clientes inactivos",
  ],
  hourlyHeatmap: [
    // 24 hours data (0-23), values 0-100
    10, 8, 5, 3, 2, 4, 8, 15, 25, 35, 45, 55, 60, 58, 62, 65, 70, 68, 55, 45,
    35, 25, 18, 12,
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

export function PerformanceKPIs({ className }: PerformanceKPIsProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        setLastUpdate(new Date());
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  const handleContactInactive = () => {
    console.log("Contacting inactive clients...");
  };

  return (
    <div
      className={cn(
        "w-80 min-w-[320px] max-w-[320px] bg-gray-900 border-r border-gray-800 flex flex-col",
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Performance KPIs</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>
        <p className="text-xs text-gray-400">
          Last update: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>

      {/* KPI Cards */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 1. Average Response Time */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">
                  Tiempo Promedio de Respuesta
                </span>
                <Info className="h-3 w-3 text-gray-500" title="Últimas 24h" />
              </div>
              <span className="text-lg">
                {getStatusEmoji(mockKPIs.responseTimeStatus)}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl font-bold",
                  getStatusColor(mockKPIs.responseTimeStatus),
                )}
              >
                {mockKPIs.avgResponseTime}
              </span>
              <span className="text-xs text-gray-400">mm:ss</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              🟢 &lt; 1 min | 🟡 1-3 min | 🔴 &gt; 3 min
            </p>
          </div>

          {/* 2. Closed Chats Percentage */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">
                  Chats Cerrados
                </span>
                <Info
                  className="h-3 w-3 text-gray-500"
                  title="% de conversaciones resueltas vs iniciadas"
                />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-400">
                {mockKPIs.closedChatsPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all"
                style={{ width: `${mockKPIs.closedChatsPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Meta: &gt; 80%</p>
          </div>

          {/* 3. Conversion Rate */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-white">
                  Conversión a Venta
                </span>
                <Info
                  className="h-3 w-3 text-gray-500"
                  title="% de leads convertidos en ventas (última semana)"
                />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-400">
                {mockKPIs.conversionRate}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Última semana</p>
          </div>

          {/* 4. Inactive Clients Alert */}
          <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30 hover:bg-red-900/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-white">
                  Clientes Inactivos
                </span>
                <Info
                  className="h-3 w-3 text-gray-500"
                  title="Sin respuesta en > 48h"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-400">
                {mockKPIs.inactiveClients}
              </span>
              <Button
                size="sm"
                className="bg-red-600 text-white hover:bg-red-700 h-8"
                onClick={handleContactInactive}
              >
                <Phone className="h-3 w-3 mr-1" />
                Contactar Ahora
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Requieren seguimiento</p>
          </div>

          {/* 5. Average Ticket Value */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  Valor Promedio por Cliente
                </span>
                <Info
                  className="h-3 w-3 text-gray-500"
                  title="Ticket medio mensual"
                />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-yellow-400">
                ${mockKPIs.avgTicketValue.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Este mes</p>
          </div>

          {/* 6. CSAT Score */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-white">
                  Satisfacción (CSAT)
                </span>
                <Info
                  className="h-3 w-3 text-gray-500"
                  title="★ promedio tras cierre de chat"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-400">
                {mockKPIs.csatScore}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.floor(mockKPIs.csatScore)
                        ? "text-orange-400 fill-orange-400"
                        : "text-gray-600",
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">De 5.0 estrellas</p>
          </div>

          {/* 7. AI Suggestions */}
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30 hover:bg-blue-900/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white">
                Sugerencias de IA
              </span>
              <Badge className="bg-blue-600 text-white text-xs">
                {mockKPIs.aiSuggestions.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {mockKPIs.aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-300 bg-gray-800/50 rounded p-2 cursor-pointer hover:bg-gray-800"
                  onClick={() => console.log(`AI Suggestion: ${suggestion}`)}
                >
                  • {suggestion}
                </div>
              ))}
            </div>
          </div>

          {/* 8. Hourly Heatmap */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:bg-gray-800/70 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">
                Heatmap Horario
              </span>
              <Info
                className="h-3 w-3 text-gray-500"
                title="Picos de tráfico por hora (0-23h)"
              />
            </div>
            <div className="grid grid-cols-12 gap-1">
              {mockKPIs.hourlyHeatmap.map((value, hour) => (
                <div
                  key={hour}
                  className={cn(
                    "h-6 rounded text-xs flex items-center justify-center font-medium transition-all cursor-pointer",
                    value >= 60
                      ? "bg-red-500 text-white"
                      : value >= 40
                        ? "bg-orange-500 text-white"
                        : value >= 20
                          ? "bg-yellow-500 text-black"
                          : value >= 10
                            ? "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-400",
                  )}
                  title={`${hour}:00 - ${value}% traffic`}
                >
                  {hour}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
