import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Send,
  Clock,
  DollarSign,
  Star,
  ArrowRight,
} from "lucide-react";

interface SummaryData {
  totalConversationsToday: number;
  messagesSent: number;
  avgResponseTime: string;
  salesValue: number;
  csatLevel: number;
}

interface SummaryCardProps {
  data: SummaryData;
  onViewDetail: () => void;
}

export function SummaryCard({ data, onViewDetail }: SummaryCardProps) {
  const summaryItems = [
    {
      icon: MessageSquare,
      label: "Total Conversaciones Hoy",
      value: data.totalConversationsToday.toLocaleString(),
      color: "text-blue-400",
    },
    {
      icon: Send,
      label: "Mensajes Enviados",
      value: data.messagesSent.toLocaleString(),
      color: "text-green-400",
    },
    {
      icon: Clock,
      label: "Tiempo Medio de Respuesta",
      value: data.avgResponseTime,
      color: "text-yellow-400",
    },
    {
      icon: DollarSign,
      label: "Valor de Ventas Generado",
      value: `$${data.salesValue.toLocaleString()}`,
      color: "text-purple-400",
    },
    {
      icon: Star,
      label: "Nivel CSAT Promedio",
      value: `${data.csatLevel}/5.0`,
      color: "text-orange-400",
    },
  ];

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
          📊 Resumen Global
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summaryItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
            >
              <div className="flex items-center" style={{ gap: "8px" }}>
                <Icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-sm text-gray-300 text-left">
                  {item.label}
                </span>
              </div>
              <span className="text-lg font-semibold text-white text-right">
                {item.value}
              </span>
            </div>
          );
        })}

        {/* View Detail Button */}
        <Button
          onClick={onViewDetail}
          className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <span>Ver Detalle</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
