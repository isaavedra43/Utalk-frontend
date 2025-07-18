import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveDashboardProps {
  className?: string;
}

// Comprehensive mock data
const dashboardData = {
  lastUpdate: new Date(),
  kpis: {
    totalSales: { value: 89450, change: 15.8, isPositive: true },
    totalOrders: { value: 234, change: 8.3, isPositive: true },
    totalClients: { value: 1247, change: -2.1, isPositive: false },
    totalMessages: { value: 6890, change: 12.5, isPositive: true },
  },
  conversion: {
    rate: 23.7,
    change: -2.1,
    isPositive: false,
  },
  csat: {
    score: 4.3,
    change: 0.2,
    isPositive: true,
  },
  agentPerformance: [
    {
      name: "María García",
      color: "#4F8EF7",
      chats: [12, 15, 18, 14, 16, 20, 17],
    },
    {
      name: "Carlos López",
      color: "#3AD29F",
      chats: [8, 12, 14, 16, 18, 15, 19],
    },
    {
      name: "Ana Rodríguez",
      color: "#FFD166",
      chats: [10, 11, 13, 12, 14, 16, 15],
    },
    {
      name: "Luis Fernández",
      color: "#EF476F",
      chats: [6, 8, 10, 12, 14, 13, 11],
    },
    {
      name: "Sofía Martín",
      color: "#9333EA",
      chats: [5, 7, 9, 11, 12, 14, 13],
    },
  ],
  regionData: {
    Norte: { sales: 25000, messages: 1200 },
    Sur: { sales: 32000, messages: 1800 },
    Centro: { sales: 28000, messages: 1500 },
  },
  topClients: [
    {
      pos: 1,
      name: "Empresa Tech S.A.",
      channel: "WhatsApp",
      chats: 45,
      value: 15680,
      avgTime: "02:15",
    },
    {
      pos: 2,
      name: "Comercial Norte",
      channel: "Email",
      chats: 38,
      value: 12450,
      avgTime: "01:45",
    },
    {
      pos: 3,
      name: "Retail Sur",
      channel: "Facebook",
      chats: 32,
      value: 9850,
      avgTime: "03:20",
    },
    {
      pos: 4,
      name: "Import Export",
      channel: "WhatsApp",
      chats: 28,
      value: 8900,
      avgTime: "02:05",
    },
    {
      pos: 5,
      name: "Distribuidor Centro",
      channel: "Email",
      chats: 25,
      value: 7650,
      avgTime: "01:50",
    },
  ],
  alerts: [
    {
      type: "critical",
      icon: AlertTriangle,
      message: "Cliente María González sin respuesta > 1h",
      action: "Contactar Ahora",
      color: "red",
    },
    {
      type: "warning",
      icon: Clock,
      message: "Agente Carlos López tiene 5 chats abiertos sin cerrar",
      action: "Reasignar",
      color: "yellow",
    },
    {
      type: "info",
      icon: Target,
      message: "Meta mensual alcanzada al 85%",
      action: "Ver Progreso",
      color: "blue",
    },
  ],
  heatmapData: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    intensity: Math.floor(Math.random() * 100),
  })),
};

export function ExecutiveDashboard({ className }: ExecutiveDashboardProps) {
  const [selectedRange, setSelectedRange] = useState("Hoy");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [selectedClient, setSelectedClient] = useState("Todos");
  const [refreshTimer, setRefreshTimer] = useState(30);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTimer((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    setRefreshTimer(30);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting dashboard as ${format}`);
  };

  const handleShare = () => {
    console.log("Generating public dashboard link");
  };

  const KPICard = ({
    title,
    value,
    change,
    isPositive,
    icon: Icon,
    format = "number",
  }: any) => (
    <Card className="bg-[#1E1E2F] border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-blue-600/20 flex-shrink-0">
              <Icon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl lg:text-2xl font-bold text-white truncate">
                {format === "currency"
                  ? `$${value.toLocaleString()}`
                  : value.toLocaleString()}
              </div>
              <div className="text-xs lg:text-sm text-gray-400 truncate">
                {title}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1 text-xs lg:text-sm font-medium flex-shrink-0 ml-2",
              isPositive ? "text-green-400" : "text-red-400",
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
            ) : (
              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4" />
            )}
            <span className="whitespace-nowrap">
              {change > 0 ? "+" : ""}
              {change}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AlertCard = ({ type, icon: Icon, message, action, color }: any) => (
    <Card
      className={cn("border-l-4 overflow-hidden", {
        "border-l-red-500 bg-red-900/20": color === "red",
        "border-l-yellow-500 bg-yellow-900/20": color === "yellow",
        "border-l-blue-500 bg-blue-900/20": color === "blue",
      })}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon
            className={cn("h-5 w-5 mt-0.5 flex-shrink-0", {
              "text-red-400": color === "red",
              "text-yellow-400": color === "yellow",
              "text-blue-400": color === "blue",
            })}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white mb-2 break-words">{message}</p>
            <Button
              size="sm"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {action}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PerformanceChart = () => (
    <div className="h-64 bg-[#252538] rounded-lg p-4 flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">
          Gráfico de Performance por Agente
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Integrar librería de gráficas
        </p>
      </div>
    </div>
  );

  const RegionChart = () => (
    <div className="h-64 bg-[#252538] rounded-lg p-4 flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Ventas vs Mensajes por Región</p>
        <p className="text-gray-600 text-xs mt-1">
          Gráfico combinado: barras + línea
        </p>
      </div>
    </div>
  );

  const HeatmapChart = () => (
    <div className="bg-[#252538] rounded-lg p-4 overflow-hidden">
      <h3 className="text-white font-semibold mb-4">
        Densidad de Mensajes (24h)
      </h3>
      <div className="grid grid-cols-6 lg:grid-cols-12 gap-1 overflow-hidden">
        {dashboardData.heatmapData.map((item) => (
          <div
            key={item.hour}
            className={cn(
              "h-8 rounded text-xs flex items-center justify-center text-white font-medium min-w-0",
              {
                "bg-green-900": item.intensity < 30,
                "bg-green-600": item.intensity >= 30 && item.intensity < 60,
                "bg-green-400": item.intensity >= 60 && item.intensity < 80,
                "bg-green-200 text-gray-900": item.intensity >= 80,
              },
            )}
            title={`${item.hour}:00 - ${item.intensity}% intensidad`}
          >
            {item.hour}
          </div>
        ))}
      </div>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 mt-3">
        <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-900 rounded flex-shrink-0"></div>
            <span>Baja</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded flex-shrink-0"></div>
            <span>Media</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded flex-shrink-0"></div>
            <span>Alta</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 truncate">
          Pico: 14:00 (95%) | Promedio: 45% | Mínimo: 02:00 (8%)
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("h-full bg-gray-950 overflow-hidden flex", className)}>
      {/* Sidebar Toggle */}
      {sidebarVisible && (
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Navegación</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start bg-blue-500 text-white hover:bg-blue-600"
            >
              <Users className="h-4 w-4 mr-2" />
              Agentes
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start bg-blue-500 text-white hover:bg-blue-600"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversaciones
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start bg-blue-500 text-white hover:bg-blue-600"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Ventas
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {!sidebarVisible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarVisible(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Dashboard de Rendimiento
                </h1>
                <p className="text-sm text-gray-400">
                  Última actualización:{" "}
                  {dashboardData.lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Range Selector */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                {["Hoy", "Últimos 7 días", "Personalizado"].map((range) => (
                  <Button
                    key={range}
                    size="sm"
                    variant={selectedRange === range ? "default" : "ghost"}
                    onClick={() => setSelectedRange(range)}
                    className={cn(
                      "h-8 px-3 text-nowrap",
                      selectedRange === range
                        ? "bg-[#346EF1] text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white hover:bg-blue-600",
                    )}
                  >
                    {range}
                  </Button>
                ))}
              </div>

              {/* Refresh Button with Timer */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  Refrescando en: 00:{refreshTimer.toString().padStart(2, "0")}
                </span>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-[#346EF1] hover:bg-blue-700 text-white"
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4 mr-2",
                      isRefreshing && "animate-spin",
                    )}
                  />
                  Actualizar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex gap-4 p-6 overflow-hidden">
            {/* Filter Panel (Column 2) */}
            <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar conversación…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-2 flex-wrap">
                {["Todas", "Sin asignar", "Etiquetas"].map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={activeFilter === filter ? "default" : "outline"}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "text-nowrap",
                      activeFilter === filter
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white border-blue-500 hover:bg-blue-600",
                    )}
                  >
                    {filter}
                  </Button>
                ))}
              </div>

              {/* Advanced Filters */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros Avanzados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Canal
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {["WhatsApp", "Email", "Facebook"].map((channel) => (
                        <Badge
                          key={channel}
                          variant="outline"
                          className="text-xs"
                        >
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">
                      Estado
                    </label>
                    <div className="flex gap-1 flex-wrap">
                      {["Respondidos", "Pendientes", "Cerrados"].map(
                        (status) => (
                          <Badge
                            key={status}
                            variant="outline"
                            className="text-xs"
                          >
                            {status}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Clients */}
              <Card className="bg-gray-800 border-gray-700 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">
                    Top 10 Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-64 px-4">
                    <div className="space-y-2 py-2">
                      {dashboardData.topClients.map((client) => (
                        <div
                          key={client.pos}
                          className="flex items-center justify-between p-2 bg-gray-700/50 rounded text-xs min-w-0"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                              {client.pos}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-white font-medium truncate">
                                {client.name}
                              </div>
                              <div className="text-gray-400 truncate">
                                {client.channel}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className="text-white whitespace-nowrap">
                              ${client.value}
                            </div>
                            <div className="text-gray-400 whitespace-nowrap">
                              {client.chats} chats
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content (Column 3) */}
            <div className="flex-1 space-y-8 overflow-y-auto">
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Total Ventas"
                  value={dashboardData.kpis.totalSales.value}
                  change={dashboardData.kpis.totalSales.change}
                  isPositive={dashboardData.kpis.totalSales.isPositive}
                  icon={DollarSign}
                  format="currency"
                />
                <KPICard
                  title="Total Órdenes"
                  value={dashboardData.kpis.totalOrders.value}
                  change={dashboardData.kpis.totalOrders.change}
                  isPositive={dashboardData.kpis.totalOrders.isPositive}
                  icon={ShoppingCart}
                />
                <KPICard
                  title="Total Clientes"
                  value={dashboardData.kpis.totalClients.value}
                  change={dashboardData.kpis.totalClients.change}
                  isPositive={dashboardData.kpis.totalClients.isPositive}
                  icon={Users}
                />
                <KPICard
                  title="Total Mensajes"
                  value={dashboardData.kpis.totalMessages.value}
                  change={dashboardData.kpis.totalMessages.change}
                  isPositive={dashboardData.kpis.totalMessages.isPositive}
                  icon={MessageSquare}
                />
              </div>

              {/* Conversion & CSAT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-[#1E1E2F] border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-400" />
                        <span className="text-white font-medium">
                          Tasa de Conversión
                        </span>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm",
                          dashboardData.conversion.isPositive
                            ? "text-green-400"
                            : "text-red-400",
                        )}
                      >
                        {dashboardData.conversion.isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {dashboardData.conversion.change}%
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {dashboardData.conversion.rate}%
                    </div>
                    <div className="h-16 bg-[#252538] rounded flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1E1E2F] border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-white font-medium">
                          Nivel CSAT Promedio
                        </span>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm",
                          dashboardData.csat.isPositive
                            ? "text-green-400"
                            : "text-red-400",
                        )}
                      >
                        {dashboardData.csat.isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        +{dashboardData.csat.change}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {dashboardData.csat.score}/5.0
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            star <= Math.floor(dashboardData.csat.score)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600",
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance by Agent */}
                <Card className="bg-[#1E1E2F] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Performance por Agente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart />
                    <div className="flex justify-center gap-4 mt-4">
                      {dashboardData.agentPerformance
                        .slice(0, 3)
                        .map((agent) => (
                          <div
                            key={agent.name}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: agent.color }}
                            ></div>
                            <span className="text-xs text-gray-400">
                              {agent.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sales vs Messages by Region */}
                <Card className="bg-[#1E1E2F] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Ventas vs Mensajes por Región
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RegionChart />
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {Object.entries(dashboardData.regionData).map(
                        ([region, data]) => (
                          <div key={region} className="text-center">
                            <div className="text-sm font-medium text-white">
                              {region}
                            </div>
                            <div className="text-xs text-gray-400">
                              ${data.sales} / {data.messages}msg
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts and Heatmap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alerts */}
                <Card className="bg-[#1E1E2F] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Alertas y Recomendaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboardData.alerts.map((alert, index) => (
                      <AlertCard key={index} {...alert} />
                    ))}
                  </CardContent>
                </Card>

                {/* Heatmap */}
                <Card className="bg-[#1E1E2F] border-gray-700">
                  <CardContent className="p-6">
                    <HeatmapChart />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#346EF1] hover:bg-blue-700 shadow-lg"
        onClick={() => handleExport("pdf")}
      >
        <Download className="h-6 w-6" />
      </Button>

      {/* Export/Share Actions */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-2">
        <Button
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          onClick={() => handleExport("csv")}
        >
          <FileText className="h-4 w-4 mr-1" />
          CSV
        </Button>
        <Button
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-1" />
          Compartir
        </Button>
      </div>
    </div>
  );
}
