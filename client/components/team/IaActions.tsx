import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Lightbulb,
  Bell,
  Zap,
  Target,
  TrendingUp,
  MessageCircle,
  Clock,
  Award,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seller } from "../EquipoPerformance";

interface IaActionsProps {
  seller: Seller;
  onSuggestImprovement: () => void;
  onSendReminder: () => void;
}

export function IaActions({
  seller,
  onSuggestImprovement,
  onSendReminder,
}: IaActionsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(new Date());

  // Generate AI insights based on seller's KPIs
  const generateAIInsights = () => {
    const insights = [];

    // Response time analysis
    if (seller.kpis.avgResponseTime > "03:00") {
      insights.push({
        type: "warning",
        icon: Clock,
        title: "Tiempo de Respuesta Elevado",
        description: `Con ${seller.kpis.avgResponseTime} promedio, considera usar respuestas predefinidas`,
        action: "Configurar Templates",
        priority: "high",
      });
    }

    // Conversion rate analysis
    if (seller.kpis.conversionRate < 20) {
      insights.push({
        type: "opportunity",
        icon: TrendingUp,
        title: "Oportunidad de Mejora en Conversión",
        description: `Tasa actual: ${seller.kpis.conversionRate}%. Objetivo: >25%`,
        action: "Plan de Capacitación",
        priority: "medium",
      });
    }

    // CSAT analysis
    if (seller.kpis.csatScore >= 4.5) {
      insights.push({
        type: "success",
        icon: Award,
        title: "Excelente Satisfacción del Cliente",
        description: `CSAT de ${seller.kpis.csatScore}/5.0. ¡Mantén este nivel!`,
        action: "Compartir Buenas Prácticas",
        priority: "low",
      });
    }

    // Complaints analysis
    if (seller.kpis.complaints > 5) {
      insights.push({
        type: "critical",
        icon: AlertTriangle,
        title: "Nivel de Quejas Elevado",
        description: `${seller.kpis.complaints} quejas registradas. Requiere atención inmediata`,
        action: "Revisión Urgente",
        priority: "critical",
      });
    }

    // Upsell opportunity
    if (seller.kpis.upsellCrosssellRate < 15) {
      insights.push({
        type: "opportunity",
        icon: Target,
        title: "Potencial de Upselling",
        description: `Tasa actual: ${seller.kpis.upsellCrosssellRate}%. Identifica oportunidades`,
        action: "Entrenamiento Ventas",
        priority: "medium",
      });
    }

    return insights.slice(0, 4); // Return max 4 insights
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setLastAnalysis(new Date());
    }, 2000);
  };

  const insights = generateAIInsights();

  const getInsightStyle = (type: string) => {
    switch (type) {
      case "critical":
        return {
          bg: "bg-red-900/20",
          border: "border-red-500/30",
          icon: "text-red-400",
          badge: "bg-red-600",
        };
      case "warning":
        return {
          bg: "bg-yellow-900/20",
          border: "border-yellow-500/30",
          icon: "text-yellow-400",
          badge: "bg-yellow-600",
        };
      case "opportunity":
        return {
          bg: "bg-blue-900/20",
          border: "border-blue-500/30",
          icon: "text-blue-400",
          badge: "bg-blue-600",
        };
      case "success":
        return {
          bg: "bg-green-900/20",
          border: "border-green-500/30",
          icon: "text-green-400",
          badge: "bg-green-600",
        };
      default:
        return {
          bg: "bg-gray-900/20",
          border: "border-gray-500/30",
          icon: "text-gray-400",
          badge: "bg-gray-600",
        };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return "Crítico";
      case "high":
        return "Alto";
      case "medium":
        return "Medio";
      case "low":
        return "Bajo";
      default:
        return "Info";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main AI Actions Card */}
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            Acciones Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={onSuggestImprovement}
              disabled={isAnalyzing}
              className="bg-blue-600 text-white hover:bg-blue-700 justify-start h-12"
            >
              <Lightbulb className="h-4 w-4 mr-3" />
              <div className="text-left">
                <p className="font-medium">Sugerir Mejora</p>
                <p className="text-xs opacity-80">
                  Análisis personalizado con IA
                </p>
              </div>
            </Button>

            <Button
              onClick={onSendReminder}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start h-12"
            >
              <Bell className="h-4 w-4 mr-3" />
              <div className="text-left">
                <p className="font-medium">Enviar Recordatorio</p>
                <p className="text-xs opacity-80">Notificación al vendedor</p>
              </div>
            </Button>
          </div>

          {/* Quick Analysis */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">
                Análisis Rápido
              </h4>
              <Button
                size="sm"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {isAnalyzing ? "Analizando..." : "Analizar"}
                </span>
              </Button>
            </div>

            {/* AI Score */}
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Puntuación IA</span>
                <Badge className="bg-blue-600 text-white text-xs">
                  {seller.kpis.aiQualityScore}/5.0
                </Badge>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(seller.kpis.aiQualityScore / 5) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Calidad de respuesta según IA
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-700 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400">IA activa</span>
            </div>
            <span className="text-gray-500">
              Última análisis: {lastAnalysis.toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Card */}
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-400" />
              Insights Personalizados
            </CardTitle>
            <Badge className="bg-gray-700 text-gray-300 text-xs">
              {insights.length} recomendaciones
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay insights disponibles</p>
              <p className="text-xs opacity-80">
                Ejecuta un análisis para generar recomendaciones
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                const style = getInsightStyle(insight.type);

                return (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
                      style.bg,
                      style.border,
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={cn("h-4 w-4 mt-0.5", style.icon)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-sm font-medium text-white">
                            {insight.title}
                          </h5>
                          <Badge
                            className={cn("text-white text-xs", style.badge)}
                          >
                            {getPriorityBadge(insight.priority)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          {insight.description}
                        </p>
                        <Button
                          size="sm"
                          className={cn(
                            "h-6 px-2 text-xs text-white transition-colors",
                            style.badge,
                            insight.type === "critical"
                              ? "hover:bg-red-700"
                              : insight.type === "warning"
                                ? "hover:bg-yellow-700"
                                : insight.type === "opportunity"
                                  ? "hover:bg-blue-700"
                                  : "hover:bg-green-700",
                          )}
                          onClick={() =>
                            console.log(
                              `Action: ${insight.action} for ${seller.name}`,
                            )
                          }
                        >
                          {insight.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
