import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  id: string;
  title: string;
  value: number;
  trend: "up" | "down";
  trendValue: string;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "yellow" | "red";
}

const colorVariants = {
  blue: {
    icon: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-500/30",
    trend: "text-blue-400",
  },
  green: {
    icon: "text-green-400",
    bg: "bg-green-900/20",
    border: "border-green-500/30",
    trend: "text-green-400",
  },
  blue: {
    icon: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-500/30",
    trend: "text-blue-400",
  },
  yellow: {
    icon: "text-yellow-400",
    bg: "bg-yellow-900/20",
    border: "border-yellow-500/30",
    trend: "text-yellow-400",
  },
  red: {
    icon: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-500/30",
    trend: "text-red-400",
  },
};

export function KpiCard({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  color,
}: KpiCardProps) {
  const colorClasses = colorVariants[color];
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  const formatValue = (val: number) => {
    if (title.includes("Ingresos")) {
      return `$${val.toLocaleString()}`;
    }
    if (title.includes("Tasa") || title.includes("%")) {
      return `${val}%`;
    }
    return val.toLocaleString();
  };

  return (
    <Card
      className={cn(
        "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20 cursor-pointer",
        colorClasses.bg,
        colorClasses.border,
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Icon className={cn("h-6 w-6", colorClasses.icon)} />
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              trend === "up" ? "text-green-400" : "text-red-400",
            )}
          >
            <TrendIcon className="h-4 w-4" />
            <span>{trendValue}</span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-bold text-white">{formatValue(value)}</p>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
        </div>

        {/* Progress indicator for percentage-based KPIs */}
        {(title.includes("Tasa") || title.includes("%")) && (
          <div className="mt-3 w-full bg-gray-700 rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                trend === "up" ? "bg-green-400" : "bg-red-400",
              )}
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
        )}

        {/* Status indicator */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                trend === "up" ? "bg-green-400" : "bg-red-400",
                trend === "up" ? "animate-pulse" : "",
              )}
            ></div>
            <span className="text-xs text-gray-500">
              {trend === "up" ? "Creciendo" : "Decreciendo"}
            </span>
          </div>
          <span className="text-xs text-gray-500">Hoy</span>
        </div>
      </CardContent>
    </Card>
  );
}
