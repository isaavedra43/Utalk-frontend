import {
  BarChart,
  CheckCircle,
  TrendingUp,
  Clock,
  Users,
  AlertCircle,
  Target,
  Award,
} from "lucide-react";
import type { Seller } from "@/types/api";

interface Kpi {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  description: string;
}

interface KpiGridProps {
  seller: Seller;
}

export function KpiGrid({ seller }: KpiGridProps) {
  const kpis: Kpi[] = [
    {
      title: "Chats Atendidos",
      value: seller.kpis.chatsAttended,
      icon: BarChart,
      color: "text-blue-400",
      description: "Total de conversaciones manejadas.",
    },
    {
      title: "Tasa de Conversión",
      value: `${seller.kpis.conversionRate}%`,
      icon: TrendingUp,
      color: "text-green-400",
      description: "Porcentaje de chats que resultaron en venta.",
    },
    {
      title: "Tiempo de Respuesta",
      value: seller.kpis.avgResponseTime,
      icon: Clock,
      color: "text-yellow-400",
      description: "Tiempo promedio para la primera respuesta.",
    },
    {
      title: "Satisfacción (CSAT)",
      value: `${seller.kpis.csatScore} / 5`,
      icon: Users,
      color: "text-purple-400",
      description: "Puntuación de satisfacción del cliente.",
    },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Métricas Clave</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">{kpi.title}</p>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
