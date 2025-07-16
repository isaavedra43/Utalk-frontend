import { Brain, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import type { Seller } from "@/types/api";
import { Button } from "@/components/ui/button";

interface Insight {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  color: string;
}

interface IaActionsProps {
  seller: Seller;
}

export function IaActions({ seller }: IaActionsProps) {
  const insights: Insight[] = [];

  if (seller.kpis.avgResponseTime > "03:00") {
    insights.push({
      icon: AlertTriangle,
      title: "Tiempo de Respuesta Alto",
      description: `Con ${seller.kpis.avgResponseTime} promedio, considera usar respuestas predefinidas.`,
      action: "Configurar Respuestas Rápidas",
      color: "text-yellow-400",
    });
  }

  if (seller.kpis.conversionRate < 20) {
    insights.push({
      icon: TrendingUp,
      title: "Oportunidad de Conversión",
      description: `Tasa actual: ${seller.kpis.conversionRate}%. Objetivo: >25%`,
      action: "Revisar Guiones de Venta",
      color: "text-green-400",
    });
  }
  
  if (seller.kpis.csatScore < 4.0) {
    insights.push({
      icon: Brain,
      title: "CSAT Bajo",
      description: `CSAT de ${seller.kpis.csatScore}/5.0. Analizar interacciones para mejorar.`,
      action: "Ver Chats con Bajo CSAT",
      color: "text-red-400",
    });
  } else if (seller.kpis.csatScore >= 4.5) {
      insights.push({
        icon: Lightbulb,
        title: "¡Excelente CSAT!",
        description: `CSAT de ${seller.kpis.csatScore}/5.0. ¡Mantén este nivel!`,
        action: "Identificar Prácticas Exitosas",
        color: "text-purple-400",
      });
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Acciones Sugeridas por IA</h3>
      {insights.length > 0 ? (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex items-center gap-4">
              <div className={`p-2 bg-gray-700 rounded-full`}>
                 <insight.icon className={`h-6 w-6 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{insight.title}</h4>
                <p className="text-sm text-gray-400">{insight.description}</p>
              </div>
              <Button variant="outline" size="sm">{insight.action}</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-400">No hay sugerencias por ahora. ¡Buen trabajo!</p>
        </div>
      )}
    </div>
  );
}
