import { useState, useEffect } from "react";
import { SummaryCard } from "./dashboard/SummaryCard";
import { AlertCard } from "./dashboard/AlertCard";
import { HeatmapChart } from "./dashboard/HeatmapChart";
import { KpiCard } from "./dashboard/KpiCard";
import { LineChartAgent } from "./dashboard/LineChartAgent";
import { BarLineChart } from "./dashboard/BarLineChart";
import { TopClientsTable } from "./dashboard/TopClientsTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveDashboardProps {
  className?: string;
}

// Mock data - replace with real API endpoints
const mockDashboardData = {
  summary: {
    totalConversationsToday: 147,
    messagesSent: 523,
    avgResponseTime: "02:15", // hh:mm format
    salesValue: 15750.25,
    csatLevel: 4.3,
  },
  alerts: [
    {
      id: "1",
      type: "critical",
      message: "Cliente María González sin respuesta > 1h",
      action: "Contactar Ahora",
    },
    {
      id: "2",
      type: "warning",
      message: "Agente Carlos López tiene 5 chats abiertos sin cerrar",
      action: "Reasignar",
    },
    {
      id: "3",
      type: "info",
      message: "Tasa de conversión 5% bajo objetivo esta semana",
      action: "Ver Detalle",
    },
    {
      id: "4",
      type: "warning",
      message: "3 clientes VIP pendientes de respuesta",
      action: "Priorizar",
    },
  ],
  kpis: [
    {
      id: "open-conversations",
      title: "Conversaciones Abiertas",
      value: 23,
      trend: "up",
      trendValue: "+15%",
      icon: MessageSquare,
      color: "blue",
    },
    {
      id: "closed-chats",
      title: "Chats Cerrados Hoy",
      value: 89,
      trend: "up",
      trendValue: "+8%",
      icon: CheckCircle,
      color: "green",
    },
    {
      id: "conversion-rate",
      title: "Tasa de Conversión (%)",
      value: 18.5,
      trend: "down",
      trendValue: "-2%",
      icon: BarChart3,
      color: "purple",
    },
    {
      id: "estimated-revenue",
      title: "Ingresos Estimados",
      value: 24800,
      trend: "up",
      trendValue: "+12%",
      icon: DollarSign,
      color: "yellow",
    },
  ],
  hourlyHeatmap: [
    12, 8, 5, 3, 2, 4, 8, 15, 25, 35, 45, 55, 60, 58, 62, 65, 70, 68, 55, 45,
    35, 25, 18, 15,
  ],
  agentPerformance: [
    { agent: "María García", data: [10, 15, 12, 18, 20, 25, 22] },
    { agent: "Carlos López", data: [8, 12, 15, 14, 16, 18, 20] },
    { agent: "Ana Morales", data: [5, 8, 10, 12, 14, 16, 15] },
    { agent: "Luis Hernández", data: [6, 9, 11, 13, 15, 17, 18] },
    { agent: "Sofia Martinez", data: [4, 7, 9, 11, 13, 15, 16] },
  ],
  salesData: {
    teams: ["Ventas Norte", "Ventas Sur", "Ventas Centro", "Ventas Online"],
    sales: [45, 32, 28, 55],
    messages: [220, 180, 150, 280],
  },
  topClients: [
    {
      id: "1",
      name: "Empresa ABC S.A.",
      channel: "whatsapp",
      totalChats: 25,
      avgResponseTime: "01:45",
      purchaseValue: 15500,
      status: "active",
    },
    {
      id: "2",
      name: "Tech Solutions Ltd",
      channel: "email",
      totalChats: 18,
      avgResponseTime: "03:20",
      purchaseValue: 12300,
      status: "active",
    },
    {
      id: "3",
      name: "Distribuidora XYZ",
      channel: "sms",
      totalChats: 32,
      avgResponseTime: "02:10",
      purchaseValue: 8900,
      status: "inactive",
    },
    // Add more mock clients...
  ],
};

export function ExecutiveDashboard({ className }: ExecutiveDashboardProps) {
  const [dateRange, setDateRange] = useState("today");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60 * 1000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1500);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    console.log(`Date range changed to: ${range}`);
  };

  const handleAlertAction = (alertId: string, action: string) => {
    console.log(`Alert ${alertId} action: ${action}`);
  };

  return (
    <div
      className={cn("h-full bg-gray-950 overflow-hidden", className)}
      style={{
        "@media (max-width: 768px)": {
          ".dashboard-mobile": {
            flexDirection: "column",
          },
        },
      }}
    >
      {/* Header */}
      <div
        className="border-b border-gray-800 bg-gray-900 py-6"
        style={{ paddingLeft: "24px", paddingRight: "24px" }}
      >
        <div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Dashboard de Rendimiento
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>

          <div
            className="flex items-center justify-end gap-4"
            style={{ marginTop: "16px" }}
          >
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              {["today", "7days", "custom"].map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={dateRange === range ? "default" : "ghost"}
                  onClick={() => handleDateRangeChange(range)}
                  className={cn(
                    "h-8 px-3",
                    dateRange === range
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white",
                  )}
                >
                  {range === "today"
                    ? "Hoy"
                    : range === "7days"
                      ? "Últimos 7 días"
                      : "Personalizado"}
                </Button>
              ))}
            </div>

            {/* Refresh Button */}
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-white"
              style={{ backgroundColor: "#4F8EF7", border: "none" }}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")}
              />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex lg:flex-row flex-col h-[calc(100%-89px)] overflow-hidden dashboard-mobile">
        {/* Left Column (1/3) - Summary Cards */}
        <div className="w-full lg:w-1/3 lg:min-w-[400px] lg:border-r border-gray-800 overflow-y-auto">
          <div
            style={{ padding: "24px", marginBottom: "24px" }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div style={{ padding: "24px" }}>
              <SummaryCard
                data={mockDashboardData.summary}
                onViewDetail={() => console.log("Navigate to CRM")}
              />
            </div>

            {/* Alerts Card */}
            <div style={{ padding: "24px" }}>
              <AlertCard
                alerts={mockDashboardData.alerts}
                onAlertAction={handleAlertAction}
              />
            </div>

            {/* Hourly Heatmap */}
            <div style={{ padding: "24px" }}>
              <HeatmapChart
                data={mockDashboardData.hourlyHeatmap}
                title="Densidad de Mensajes (24h)"
              />
            </div>
          </div>
        </div>

        {/* Center Column - KPI Cards */}
        <div className="w-full lg:flex-1 overflow-y-auto">
          <div style={{ padding: "24px", marginBottom: "24px" }}>
            {/* KPI Cards with 24px gaps */}
            <div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4"
              style={{ gap: "24px" }}
            >
              {mockDashboardData.kpis.map((kpi) => (
                <div key={kpi.id} style={{ padding: "24px" }}>
                  <KpiCard {...kpi} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Charts Stacked Vertically */}
        <div className="w-full lg:w-1/3 lg:min-w-[400px] lg:border-l border-gray-800 overflow-y-auto">
          <div style={{ padding: "24px", marginBottom: "24px" }}>
            {/* Performance por Agente */}
            <div style={{ padding: "24px", marginBottom: "24px" }}>
              <LineChartAgent
                data={mockDashboardData.agentPerformance}
                title="Performance por Agente"
              />
            </div>

            {/* Ventas vs Mensajes */}
            <div style={{ padding: "24px", marginBottom: "24px" }}>
              <BarLineChart
                data={mockDashboardData.salesData}
                title="Ventas vs Mensajes"
              />
            </div>

            {/* Top Clients Table */}
            <div style={{ padding: "24px" }}>
              <TopClientsTable
                clients={mockDashboardData.topClients}
                title="Top 10 Clientes"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
