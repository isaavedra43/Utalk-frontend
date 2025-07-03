import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Send,
  CheckCircle,
  Eye,
  MousePointer,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Star,
  DollarSign,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign } from "../CampaignModule";

interface CampaignStatsProps {
  campaign: Campaign;
}

export function CampaignStats({ campaign }: CampaignStatsProps) {
  const stats = campaign.stats;

  if (!stats) {
    return (
      <div className="h-full bg-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400 p-8">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Sin estadísticas</h3>
          <p className="text-sm">
            Las estadísticas aparecerán después del envío
          </p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      id: "sent",
      label: "Enviados",
      value: stats.sent,
      format: "number",
      icon: Send,
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
      borderColor: "border-blue-500/30",
      change: 12.5,
    },
    {
      id: "delivered",
      label: "Entregados",
      value: stats.delivered,
      format: "number",
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-900/20",
      borderColor: "border-green-500/30",
      change: 8.3,
    },
    {
      id: "opened",
      label: "Abiertos",
      value: stats.opened,
      format: "number",
      icon: Eye,
      color: "text-purple-400",
      bgColor: "bg-purple-900/20",
      borderColor: "border-purple-500/30",
      change: 15.7,
    },
    {
      id: "clicked",
      label: "Clics",
      value: stats.clicked,
      format: "number",
      icon: MousePointer,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      borderColor: "border-yellow-500/30",
      change: 22.1,
    },
    {
      id: "replied",
      label: "Respuestas",
      value: stats.replied,
      format: "number",
      icon: MessageSquare,
      color: "text-cyan-400",
      bgColor: "bg-cyan-900/20",
      borderColor: "border-cyan-500/30",
      change: 6.4,
    },
    {
      id: "errors",
      label: "Errores",
      value: stats.errors,
      format: "number",
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-900/20",
      borderColor: "border-red-500/30",
      change: -18.2,
    },
    {
      id: "conversionRate",
      label: "Tasa de Conversión",
      value: stats.conversionRate,
      format: "percentage",
      icon: TrendingUp,
      color: "text-indigo-400",
      bgColor: "bg-indigo-900/20",
      borderColor: "border-indigo-500/30",
      change: 3.8,
    },
    {
      id: "csat",
      label: "Feedback CSAT",
      value: stats.csat,
      format: "rating",
      icon: Star,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20",
      borderColor: "border-orange-500/30",
      change: 4.2,
    },
    {
      id: "incomingMessages",
      label: "Mensajes Entrantes",
      value: stats.incomingMessages,
      format: "number",
      icon: MessageSquare,
      color: "text-pink-400",
      bgColor: "bg-pink-900/20",
      borderColor: "border-pink-500/30",
      change: 28.5,
    },
    {
      id: "estimatedROI",
      label: "ROI Estimado",
      value: stats.estimatedROI,
      format: "currency",
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-900/20",
      borderColor: "border-emerald-500/30",
      change: 156.7,
    },
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "currency":
        return `$${value.toLocaleString()}`;
      case "rating":
        return `${value.toFixed(1)}/5.0`;
      default:
        return value.toLocaleString();
    }
  };

  const calculateOpenRate = () => {
    return ((stats.opened / stats.delivered) * 100).toFixed(1);
  };

  const calculateClickRate = () => {
    return ((stats.clicked / stats.opened) * 100).toFixed(1);
  };

  const calculateErrorRate = () => {
    return ((stats.errors / stats.sent) * 100).toFixed(1);
  };

  return (
    <div className="h-full bg-gray-950 flex flex-col">
      {/* Stats Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Estadísticas de Campaña
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300"
              onClick={() => console.log("{{exportStats}}")}
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300"
              onClick={() => console.log("{{refreshStats}}")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Resultados en tiempo real de tu campaña
        </p>
      </div>

      {/* Stats Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {kpiCards.map((kpi) => {
                const Icon = kpi.icon;
                const isPositive = kpi.change > 0;
                const isGoodChange =
                  kpi.id === "errors" ? kpi.change < 0 : kpi.change > 0;

                return (
                  <Card
                    key={kpi.id}
                    className={cn(
                      "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300",
                      kpi.bgColor,
                      kpi.borderColor,
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-gray-700/50">
                          <Icon className={cn("h-4 w-4", kpi.color)} />
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            isGoodChange ? "text-green-400" : "text-red-400",
                          )}
                        >
                          {isPositive ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          <span>{Math.abs(kpi.change)}%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-white">
                          {formatValue(kpi.value, kpi.format)}
                        </p>
                        <p className="text-sm text-gray-400 font-medium">
                          {kpi.label}
                        </p>
                      </div>

                      {/* Progress bar for rates */}
                      {kpi.format === "percentage" && (
                        <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-500",
                              isGoodChange ? "bg-green-400" : "bg-red-400",
                            )}
                            style={{
                              width: `${Math.min(kpi.value, 100)}%`,
                            }}
                          ></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Calculated Rates */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">
                Métricas Calculadas
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {calculateOpenRate()}%
                    </p>
                    <p className="text-sm text-gray-400">Tasa de Apertura</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Abiertos / Entregados
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {calculateClickRate()}%
                    </p>
                    <p className="text-sm text-gray-400">Tasa de Clics</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Clics / Abiertos
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">
                      {calculateErrorRate()}%
                    </p>
                    <p className="text-sm text-gray-400">Tasa de Error</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Errores / Enviados
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Channel Breakdown */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">
                Rendimiento por Canal
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {campaign.channels.map((channel) => {
                  const channelStats = {
                    whatsapp: { sent: 400, delivered: 380, opened: 320 },
                    email: { sent: 300, delivered: 290, opened: 245 },
                    sms: { sent: 100, delivered: 86, opened: 75 },
                    facebook: { sent: 0, delivered: 0, opened: 0 },
                  };

                  const data = channelStats[channel];
                  const deliveryRate = (
                    (data.delivered / data.sent) *
                    100
                  ).toFixed(1);
                  const openRate = (
                    (data.opened / data.delivered) *
                    100
                  ).toFixed(1);

                  return (
                    <Card
                      key={channel}
                      className="bg-gray-800/50 border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="capitalize bg-gray-700 text-gray-300">
                            {channel}
                          </Badge>
                          <div className="text-sm text-gray-400">
                            {data.sent.toLocaleString()} enviados
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                          <div>
                            <p className="text-green-400 font-bold">
                              {deliveryRate}%
                            </p>
                            <p className="text-gray-400">Entregados</p>
                          </div>
                          <div>
                            <p className="text-blue-400 font-bold">
                              {openRate}%
                            </p>
                            <p className="text-gray-400">Abiertos</p>
                          </div>
                          <div>
                            <p className="text-purple-400 font-bold">
                              {(data.opened * 0.18).toFixed(0)}
                            </p>
                            <p className="text-gray-400">Clics</p>
                          </div>
                        </div>

                        {/* Progress bars */}
                        <div className="mt-3 space-y-2">
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Entrega</span>
                              <span>{deliveryRate}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-green-400 h-1 rounded-full"
                                style={{ width: `${deliveryRate}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Apertura</span>
                              <span>{openRate}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-blue-400 h-1 rounded-full"
                                style={{ width: `${openRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Performance Summary */}
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Resumen de Rendimiento
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-purple-400">
                      {((stats.delivered / stats.sent) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-300">Tasa de Entrega</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-400">
                      {calculateOpenRate()}%
                    </p>
                    <p className="text-sm text-gray-300">Tasa de Apertura</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-400">
                      {stats.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-300">Conversión</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-400">
                      ${stats.estimatedROI.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">ROI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Stats Actions */}
      <div className="border-t border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Última actualización: hace 2 minutos</span>
          <span>Datos actualizados automáticamente cada 5 minutos</span>
        </div>
      </div>
    </div>
  );
}
