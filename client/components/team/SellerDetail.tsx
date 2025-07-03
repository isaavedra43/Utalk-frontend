import { ScrollArea } from "@/components/ui/scroll-area";
import { KpiGrid } from "./KpiGrid";
import { TrendCharts } from "./TrendCharts";
import { IaActions } from "./IaActions";
import { PermissionsCard } from "./PermissionsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Settings, CheckCircle, XCircle, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seller } from "../EquipoPerformance";

interface SellerDetailProps {
  seller: Seller;
  onEditProfile: () => void;
  onReassignPermissions: () => void;
}

export function SellerDetail({
  seller,
  onEditProfile,
  onReassignPermissions,
}: SellerDetailProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full bg-gray-950 overflow-hidden">
      {/* Profile Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Large Avatar */}
            <div className="relative">
              {seller.avatar ? (
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-16 h-16 rounded-full object-cover border-3 border-gray-600"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-3 border-gray-600">
                  <span className="text-white text-lg font-bold">
                    {getInitials(seller.name)}
                  </span>
                </div>
              )}
              {/* Status Indicator */}
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-gray-900 flex items-center justify-center",
                  seller.status === "active" ? "bg-green-500" : "bg-red-500",
                )}
              >
                {seller.status === "active" ? (
                  <CheckCircle className="w-3 h-3 text-white" />
                ) : (
                  <XCircle className="w-3 h-3 text-white" />
                )}
              </div>
            </div>

            {/* Name and Role */}
            <div>
              <h1 className="text-2xl font-bold text-white">{seller.name}</h1>
              <p className="text-gray-400 text-lg">{seller.role}</p>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-400">{seller.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "border text-sm px-3 py-1",
                seller.status === "active"
                  ? "bg-green-900/20 text-green-400 border-green-500/30"
                  : "bg-red-900/20 text-red-400 border-red-500/30",
              )}
            >
              {seller.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
            <Button
              onClick={onEditProfile}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
            <Button
              onClick={onReassignPermissions}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Reasignar Permisos
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="h-[calc(100%-140px)]">
        <div className="p-6 space-y-6">
          {/* Permissions Section */}
          <PermissionsCard
            seller={seller}
            onPermissionChange={(permission, value) =>
              console.log(`Permission ${permission} changed to ${value}`)
            }
            onToggleEnabled={(enabled) =>
              console.log(`Seller enabled: ${enabled}`)
            }
          />

          {/* KPIs Grid Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                KPIs de Rendimiento
              </h2>
              <Badge className="bg-gray-700 text-gray-300 text-xs">
                20 indicadores
              </Badge>
            </div>
            <KpiGrid seller={seller} />
          </div>

          {/* Trend Charts Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Gráficos de Tendencia
            </h2>
            <TrendCharts seller={seller} />
          </div>

          {/* AI Actions Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Acciones IA
            </h2>
            <IaActions
              seller={seller}
              onSuggestImprovement={() =>
                console.log(`Suggest improvement for ${seller.name}`)
              }
              onSendReminder={() =>
                console.log(`Send reminder to ${seller.name}`)
              }
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
