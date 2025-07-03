import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  Star,
  ThumbsUp,
  Mail,
  MousePointer,
  Link,
  Heart,
  AlertTriangle,
  Target,
  Timer,
  Award,
  Zap,
  Brain,
  TrendingDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seller } from "../EquipoPerformance";

interface KpiGridProps {
  seller: Seller;
}

interface KpiItem {
  id: string;
  label: string;
  value: string | number;
  change: number; // Percentage change
  icon: any;
  color: string;
  unit?: string;
  format?: "number" | "percentage" | "currency" | "time" | "rating";
}

export function KpiGrid({ seller }: KpiGridProps) {
  // Define all 20 KPIs with their respective data
  const kpis: KpiItem[] = [
    {
      id: "chats-attended",
      label: "Chats Atendidos",
      value: seller.kpis.chatsAttended,
      change: 12.5,
      icon: MessageSquare,
      color: "text-blue-400",
      format: "number",
    },
    {
      id: "messages-responded",
      label: "Mensajes Respondidos",
      value: seller.kpis.messagesResponded,
      change: 8.3,
      icon: Send,
      color: "text-green-400",
      format: "number",
    },
    {
      id: "avg-response-time",
      label: "Tiempo Medio Respuesta",
      value: seller.kpis.avgResponseTime,
      change: -5.2,
      icon: Clock,
      color: "text-yellow-400",
      format: "time",
    },
    {
      id: "chats-closed-no-escalation",
      label: "Chats Cerrados Sin Escalamiento",
      value: seller.kpis.chatsClosedWithoutEscalation,
      change: 15.7,
      icon: CheckCircle,
      color: "text-green-400",
      format: "number",
    },
    {
      id: "conversion-rate",
      label: "Tasa Conversión Chat → Venta",
      value: seller.kpis.conversionRate,
      change: 3.4,
      icon: TrendingUp,
      color: "text-purple-400",
      format: "percentage",
    },
    {
      id: "attributable-revenue",
      label: "Ingresos Atribuibles",
      value: seller.kpis.attributableRevenue,
      change: 22.1,
      icon: DollarSign,
      color: "text-green-500",
      format: "currency",
    },
    {
      id: "avg-ticket-value",
      label: "Ticket Promedio",
      value: seller.kpis.avgTicketValue,
      change: 7.8,
      icon: Receipt,
      color: "text-blue-500",
      format: "currency",
    },
    {
      id: "customer-retention",
      label: "Tasa Retención Cliente",
      value: seller.kpis.customerRetentionRate,
      change: 4.2,
      icon: Users,
      color: "text-cyan-400",
      format: "percentage",
    },
    {
      id: "csat-score",
      label: "Satisfacción CSAT",
      value: seller.kpis.csatScore,
      change: 2.1,
      icon: Star,
      color: "text-yellow-500",
      format: "rating",
    },
    {
      id: "nps-score",
      label: "NPS Parcial",
      value: seller.kpis.npsScore,
      change: 1.8,
      icon: ThumbsUp,
      color: "text-orange-400",
      format: "number",
    },
    {
      id: "campaigns-sent",
      label: "Campañas Enviadas",
      value: seller.kpis.campaignsSent,
      change: 18.9,
      icon: Mail,
      color: "text-indigo-400",
      format: "number",
    },
    {
      id: "message-open-rate",
      label: "Tasa Apertura Mensajes",
      value: seller.kpis.messageOpenRate,
      change: 6.3,
      icon: MousePointer,
      color: "text-pink-400",
      format: "percentage",
    },
    {
      id: "link-click-rate",
      label: "Tasa Clics Enlaces",
      value: seller.kpis.linkClickRate,
      change: -1.2,
      icon: Link,
      color: "text-teal-400",
      format: "percentage",
    },
    {
      id: "positive-responses",
      label: "Respuestas Positivas",
      value: seller.kpis.positiveResponses,
      change: 14.6,
      icon: Heart,
      color: "text-red-400",
      format: "number",
    },
    {
      id: "complaints",
      label: "Reclamaciones / Quejas",
      value: seller.kpis.complaints,
      change: -23.5,
      icon: AlertTriangle,
      color: "text-red-500",
      format: "number",
    },
    {
      id: "continuity-percentage",
      label: "% Continuidad (Seguimiento)",
      value: seller.kpis.continuityPercentage,
      change: 9.1,
      icon: Target,
      color: "text-emerald-400",
      format: "percentage",
    },
    {
      id: "total-chat-time",
      label: "Tiempo Total en Chats",
      value: seller.kpis.totalChatTime,
      change: 5.7,
      icon: Timer,
      color: "text-amber-400",
      format: "time",
    },
    {
      id: "first-time-resolution",
      label: "Chats Resueltos Primera Vez",
      value: seller.kpis.firstTimeResolution,
      change: 11.3,
      icon: Award,
      color: "text-violet-400",
      format: "percentage",
    },
    {
      id: "upsell-crosssell",
      label: "Tasa Upsell / Cross-sell",
      value: seller.kpis.upsellCrosssellRate,
      change: 8.9,
      icon: Zap,
      color: "text-lime-400",
      format: "percentage",
    },
    {
      id: "ai-quality-score",
      label: "Feedback IA (Calidad)",
      value: seller.kpis.aiQualityScore,
      change: 3.2,
      icon: Brain,
      color: "text-sky-400",
      format: "rating",
    },
  ];

  const formatValue = (value: string | number, format?: string) => {
    if (typeof value === "string") return value;

    switch (format) {
      case "percentage":
        return `${value}%`;
      case "currency":
        return `$${value.toLocaleString()}`;
      case "rating":
        return `${value}/5.0`;
      case "time":
        return value;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change > 0;
        const isNegative = kpi.change < 0;

        // Special handling for complaints where negative change is good
        const isGoodChange =
          kpi.id === "complaints" ? kpi.change < 0 : kpi.change > 0;

        return (
          <Card
            key={kpi.id}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20"
          >
            <CardContent className="p-4">
              {/* Header with Icon and Change */}
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg bg-gray-700/50")}>
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

              {/* Value */}
              <div className="mb-2">
                <p className="text-2xl font-bold text-white">
                  {formatValue(kpi.value, kpi.format)}
                </p>
              </div>

              {/* Label */}
              <p className="text-sm text-gray-400 font-medium leading-tight">
                {kpi.label}
              </p>

              {/* Progress indicator for percentage and rating KPIs */}
              {(kpi.format === "percentage" || kpi.format === "rating") && (
                <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      isGoodChange ? "bg-green-400" : "bg-red-400",
                    )}
                    style={{
                      width: `${Math.min(
                        kpi.format === "rating"
                          ? ((kpi.value as number) / 5) * 100
                          : Math.min(kpi.value as number, 100),
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
              )}

              {/* Status indicator */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isGoodChange ? "bg-green-400" : "bg-red-400",
                      isGoodChange ? "animate-pulse" : "",
                    )}
                  ></div>
                  <span className="text-xs text-gray-500">
                    {isGoodChange ? "Mejorando" : "Requiere atención"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
