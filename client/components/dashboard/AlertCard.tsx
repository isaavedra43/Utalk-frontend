import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  action: string;
}

interface AlertCardProps {
  alerts: Alert[];
  onAlertAction: (alertId: string, action: string) => void;
}

const alertConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-500/30",
    badgeColor: "bg-red-600",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20",
    borderColor: "border-yellow-500/30",
    badgeColor: "bg-yellow-600",
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-600",
  },
};

export function AlertCard({ alerts, onAlertAction }: AlertCardProps) {
  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            Alertas y Recomendaciones
          </CardTitle>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge className="bg-red-600 text-white text-xs">
                {criticalCount} críticas
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-yellow-600 text-white text-xs">
                {warningCount} advertencias
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay alertas en este momento</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = alertConfig[alert.type];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                  config.bgColor,
                  config.borderColor,
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 mb-2">
                      {alert.message}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => onAlertAction(alert.id, alert.action)}
                      className={cn(
                        "h-7 px-3 text-xs text-white transition-colors",
                        config.badgeColor,
                        alert.type === "critical"
                          ? "hover:bg-red-700"
                          : alert.type === "warning"
                            ? "hover:bg-yellow-700"
                            : "hover:bg-blue-700",
                      )}
                    >
                      {alert.action}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* AI Status */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400">
                IA activa - monitoreo continuo
              </span>
            </div>
            <span className="text-gray-500">Próxima revisión en 5 min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
