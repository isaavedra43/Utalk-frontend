import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveDashboardProps {
  className?: string;
}

// Mock data
const dashboardData = {
  lastUpdate: new Date(),
  summary: {
    totalConversationsToday: 147,
    messagesSent: 523,
    avgResponseTime: "02:15",
    salesValue: 15750.25,
    csatLevel: 4.3,
  },
  kpis: [
    {
      id: "conversations",
      title: "Conversaciones Abiertas",
      value: 89,
      change: 12.5,
      isPositive: true,
      icon: MessageSquare,
    },
    {
      id: "closed",
      title: "Chats Cerrados",
      value: 234,
      change: 8.3,
      isPositive: true,
      icon: CheckCircle,
    },
    {
      id: "conversion",
      title: "Tasa de Conversión",
      value: 23.7,
      change: -2.1,
      isPositive: false,
      icon: Target,
      unit: "%",
    },
    {
      id: "revenue",
      title: "Ingresos Estimados",
      value: 45230,
      change: 15.8,
      isPositive: true,
      icon: DollarSign,
      unit: "$",
    },
  ],
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
      message: "Meta mensual alcanzada al 85%",
      action: "Ver Progreso",
    },
  ],
  agentPerformance: {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    agents: [
      {
        name: "María García",
        data: [85, 92, 88, 95, 90, 87, 93],
        color: "#4F8EF7",
      },
      {
        name: "Carlos López",
        data: [78, 85, 82, 88, 85, 80, 86],
        color: "#3AD29F",
      },
      {
        name: "Ana Rodríguez",
        data: [92, 88, 95, 90, 93, 89, 91],
        color: "#FFD166",
      },
    ],
  },
  salesVsMessages: {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    sales: [12500, 15200, 13800, 16900, 14500, 18200],
    messages: [890, 1120, 980, 1350, 1100, 1450],
  },
};

export function ExecutiveDashboard({ className }: ExecutiveDashboardProps) {
  const [dateRange, setDateRange] = useState("today");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  const handleAlertAction = (alertId: string, action: string) => {
    console.log(`Alert ${alertId} action: ${action}`);
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === "$") {
      return `$${value.toLocaleString()}`;
    }
    if (unit === "%") {
      return `${value}%`;
    }
    return value.toLocaleString();
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-600";
      case "warning":
        return "bg-yellow-600";
      case "info":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className={cn("h-full bg-gray-950 overflow-auto", className)}>
      {/* Main Container */}
      <div
        className="w-full"
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "24px",
          fontFamily: "Montserrat, sans-serif",
        }}
      >
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Title Section - Column 1 */}
          <div className="col-span-1">
            <h1
              className="text-white"
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: "4px",
              }}
            >
              Dashboard de Rendimiento
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#A0A0A0",
                marginTop: "4px",
              }}
            >
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>

          {/* Empty Column 2 */}
          <div className="col-span-1"></div>

          {/* Filters and Actions - Column 3 */}
          <div className="col-span-1 flex items-start justify-end gap-4">
            {/* Date Range Filters */}
            <div
              className="flex items-center"
              style={{
                borderRadius: "8px",
                padding: "8px 16px",
                background: "#1F1F1F",
              }}
            >
              {["today", "7days", "custom"].map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  className={cn(
                    "px-3 py-1 text-sm rounded transition-colors",
                    dateRange === range
                      ? "text-white"
                      : "text-gray-400 hover:text-white",
                  )}
                  style={
                    dateRange === range
                      ? {
                          background: "#4F8EF7",
                          color: "#FFFFFF",
                        }
                      : {}
                  }
                >
                  {range === "today"
                    ? "Hoy"
                    : range === "7days"
                      ? "Últimos 7 días"
                      : "Personalizado"}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center text-white disabled:opacity-50"
              style={{
                background: "#4F8EF7",
                color: "#FFFFFF",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")}
              />
              Actualizar
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Row 1 - Column 1: Resumen Global */}
          <div
            className="lg:row-span-1"
            style={{
              background: "#1E1E2F",
              borderRadius: "12px",
              padding: "24px",
              height: "100%",
            }}
          >
            <h3
              className="text-white mb-6"
              style={{ fontSize: "18px", fontWeight: "600" }}
            >
              📊 Resumen Global
            </h3>

            {/* Summary Items */}
            <div className="space-y-4">
              {[
                {
                  icon: MessageSquare,
                  label: "Total Conversaciones Hoy",
                  value: dashboardData.summary.totalConversationsToday,
                  color: "#4F8EF7",
                },
                {
                  icon: Clock,
                  label: "Mensajes Enviados",
                  value: dashboardData.summary.messagesSent,
                  color: "#3AD29F",
                },
                {
                  icon: Clock,
                  label: "Tiempo Medio de Respuesta",
                  value: dashboardData.summary.avgResponseTime,
                  color: "#FFD166",
                },
                {
                  icon: DollarSign,
                  label: "Valor de Ventas Generado",
                  value: `$${dashboardData.summary.salesValue.toLocaleString()}`,
                  color: "#EF476F",
                },
                {
                  icon: Users,
                  label: "Nivel CSAT Promedio",
                  value: `${dashboardData.summary.csatLevel}/5.0`,
                  color: "#9333EA",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center gap-3"
                  >
                    {/* Icon Column - 24px width */}
                    <div className="col-span-1">
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    {/* Text Column - calc(100% - 100px) */}
                    <div className="col-span-8">
                      <span
                        className="text-gray-300"
                        style={{ fontSize: "14px" }}
                      >
                        {item.label}
                      </span>
                    </div>
                    {/* Value Column - 80px width, right aligned */}
                    <div className="col-span-3 text-right">
                      <span
                        className="text-white"
                        style={{ fontWeight: "600", fontSize: "14px" }}
                      >
                        {item.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ver Detalle Button */}
            <button
              onClick={() => console.log("Ver detalle")}
              className="w-full text-white mt-6"
              style={{
                background: "#4F8EF7",
                color: "#FFFFFF",
                borderRadius: "8px",
                padding: "12px",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Ver Detalle
            </button>
          </div>

          {/* Row 1 - Columns 2-3: KPI Cards */}
          {dashboardData.kpis.slice(0, 3).map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                style={{
                  background: "#1E1E2F",
                  borderRadius: "12px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* Top Section - Icon + Change */}
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                  <div className="flex items-center">
                    {kpi.isPositive ? (
                      <TrendingUp
                        className="w-4 h-4 mr-1"
                        style={{ color: "#3AD29F" }}
                      />
                    ) : (
                      <TrendingDown
                        className="w-4 h-4 mr-1"
                        style={{ color: "#EF476F" }}
                      />
                    )}
                    <span
                      style={{
                        color: kpi.isPositive ? "#3AD29F" : "#EF476F",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      {kpi.change > 0 ? "+" : ""}
                      {kpi.change}%
                    </span>
                  </div>
                </div>

                {/* Center - Main Value */}
                <div className="text-center mb-4">
                  <div
                    className="text-white"
                    style={{ fontSize: "32px", fontWeight: "bold" }}
                  >
                    {formatValue(kpi.value, kpi.unit)}
                  </div>
                </div>

                {/* Bottom - Description */}
                <div className="text-center">
                  <span className="text-gray-400" style={{ fontSize: "14px" }}>
                    {kpi.title}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Row 2 - Column 1: Alertas y Recomendaciones */}
          <div
            style={{
              background: "#1E1E2F",
              borderRadius: "12px",
              padding: "24px",
              height: "300px",
              overflowY: "auto",
            }}
          >
            <h3
              className="text-white mb-4"
              style={{ fontSize: "18px", fontWeight: "600" }}
            >
              🚨 Alertas y Recomendaciones
            </h3>

            <div className="space-y-4">
              {dashboardData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg"
                  style={{
                    background: "#252538",
                    marginBottom: "16px",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="w-5 h-5 mt-0.5"
                      style={{
                        color:
                          alert.type === "critical"
                            ? "#EF476F"
                            : alert.type === "warning"
                              ? "#FFD166"
                              : "#4F8EF7",
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-white text-sm mb-2"
                        style={{ fontSize: "14px" }}
                      >
                        {alert.message}
                      </p>
                      <button
                        onClick={() =>
                          handleAlertAction(alert.id, alert.action)
                        }
                        className={cn(
                          "px-3 py-1 rounded text-white text-xs",
                          getAlertColor(alert.type),
                        )}
                        style={{ fontSize: "12px" }}
                      >
                        {alert.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Column 2: Performance por Agente */}
          <div
            style={{
              background: "#1E1E2F",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-white"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                📈 Performance por Agente
              </h3>
              <Badge
                className="text-xs"
                style={{ background: "#4F8EF7", color: "#FFFFFF" }}
              >
                Últimos 7 días
              </Badge>
            </div>

            {/* Chart Container */}
            <div
              className="relative"
              style={{
                height: "280px",
                width: "100%",
                background: "#252538",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Gráfica de Performance</p>
                <p className="text-gray-600 text-xs mt-1">
                  Integrar librería de gráficas
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              {dashboardData.agentPerformance.agents.map((agent) => (
                <div key={agent.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  ></div>
                  <span
                    className="text-gray-400 text-xs"
                    style={{ fontSize: "12px" }}
                  >
                    {agent.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Column 3: Ventas vs Mensajes + Fourth KPI */}
          <div className="space-y-6">
            {/* Fourth KPI Card */}
            {(() => {
              const kpi = dashboardData.kpis[3];
              const Icon = kpi.icon;
              return (
                <div
                  style={{
                    background: "#1E1E2F",
                    borderRadius: "12px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Top Section - Icon + Change */}
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-6 h-6 text-green-400" />
                    <div className="flex items-center">
                      {kpi.isPositive ? (
                        <TrendingUp
                          className="w-4 h-4 mr-1"
                          style={{ color: "#3AD29F" }}
                        />
                      ) : (
                        <TrendingDown
                          className="w-4 h-4 mr-1"
                          style={{ color: "#EF476F" }}
                        />
                      )}
                      <span
                        style={{
                          color: kpi.isPositive ? "#3AD29F" : "#EF476F",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        {kpi.change > 0 ? "+" : ""}
                        {kpi.change}%
                      </span>
                    </div>
                  </div>

                  {/* Center - Main Value */}
                  <div className="text-center mb-4">
                    <div
                      className="text-white"
                      style={{ fontSize: "32px", fontWeight: "bold" }}
                    >
                      {formatValue(kpi.value, kpi.unit)}
                    </div>
                  </div>

                  {/* Bottom - Description */}
                  <div className="text-center">
                    <span
                      className="text-gray-400"
                      style={{ fontSize: "14px" }}
                    >
                      {kpi.title}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Ventas vs Mensajes Chart */}
            <div
              style={{
                background: "#1E1E2F",
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h3
                className="text-white mb-4"
                style={{ fontSize: "18px", fontWeight: "600" }}
              >
                💰 Ventas vs Mensajes
              </h3>

              {/* Chart Container */}
              <div
                className="relative"
                style={{
                  height: "280px",
                  width: "100%",
                  background: "#252538",
                  borderRadius: "8px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Gráfica Mixta</p>
                  <p className="text-gray-600 text-xs">Barras + Líneas</p>
                </div>
              </div>

              {/* Mini Cards */}
              <div className="flex gap-4 mt-4">
                <div
                  className="flex-1 p-3 rounded-lg"
                  style={{ background: "#252538" }}
                >
                  <div className="text-center">
                    <div
                      className="text-white font-bold"
                      style={{ fontSize: "20px" }}
                    >
                      $89,450
                    </div>
                    <div className="text-gray-400" style={{ fontSize: "12px" }}>
                      Total Ventas
                    </div>
                  </div>
                </div>
                <div
                  className="flex-1 p-3 rounded-lg"
                  style={{ background: "#252538" }}
                >
                  <div className="text-center">
                    <div
                      className="text-white font-bold"
                      style={{ fontSize: "20px" }}
                    >
                      6,890
                    </div>
                    <div className="text-gray-400" style={{ fontSize: "12px" }}>
                      Total Mensajes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
