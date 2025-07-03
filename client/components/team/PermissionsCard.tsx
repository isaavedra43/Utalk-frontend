import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  FileText,
  Edit3,
  CheckCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seller } from "../EquipoPerformance";

interface PermissionsCardProps {
  seller: Seller;
  onPermissionChange: (permission: string, value: boolean) => void;
  onToggleEnabled: (enabled: boolean) => void;
}

export function PermissionsCard({
  seller,
  onPermissionChange,
  onToggleEnabled,
}: PermissionsCardProps) {
  const [isEnabled, setIsEnabled] = useState(seller.status === "active");

  const permissions = [
    {
      id: "read",
      label: "Lectura",
      description: "Ver conversaciones y datos de clientes",
      icon: FileText,
      value: seller.permissions.read,
      color: "text-blue-400",
    },
    {
      id: "write",
      label: "Escritura",
      description: "Enviar mensajes y responder a clientes",
      icon: Edit3,
      value: seller.permissions.write,
      color: "text-green-400",
    },
    {
      id: "approve",
      label: "Aprobación",
      description: "Aprobar campañas y decisiones importantes",
      icon: CheckCircle,
      value: seller.permissions.approve,
      color: "text-yellow-400",
    },
    {
      id: "admin",
      label: "Configuración",
      description: "Acceso a configuración del sistema",
      icon: Settings,
      value: seller.permissions.admin,
      color: "text-red-400",
    },
  ];

  const handleToggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    onToggleEnabled(enabled);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    onPermissionChange(permissionId, checked);
  };

  const getPermissionLevel = () => {
    const enabledPermissions = permissions.filter((p) => p.value).length;
    if (enabledPermissions === 0)
      return { level: "Sin acceso", color: "text-gray-400" };
    if (enabledPermissions === 1)
      return { level: "Básico", color: "text-blue-400" };
    if (enabledPermissions === 2)
      return { level: "Intermedio", color: "text-green-400" };
    if (enabledPermissions === 3)
      return { level: "Avanzado", color: "text-yellow-400" };
    return { level: "Administrador", color: "text-red-400" };
  };

  const permissionLevel = getPermissionLevel();

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Permisos y Accesos
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge className={cn("text-xs", permissionLevel.color)}>
              {permissionLevel.level}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {isEnabled ? "Habilitado" : "Deshabilitado"}
              </span>
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleEnabled}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {permissions.map((permission) => {
            const Icon = permission.icon;

            return (
              <div
                key={permission.id}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200",
                  permission.value && isEnabled
                    ? "bg-gray-700/30 border-gray-600"
                    : "bg-gray-900/30 border-gray-700",
                  !isEnabled && "opacity-50",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex-shrink-0 p-2 rounded-lg",
                      permission.value && isEnabled
                        ? "bg-gray-700"
                        : "bg-gray-800/50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        permission.value && isEnabled
                          ? permission.color
                          : "text-gray-500",
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Checkbox
                        id={permission.id}
                        checked={permission.value}
                        disabled={!isEnabled}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(
                            permission.id,
                            checked as boolean,
                          )
                        }
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label
                        htmlFor={permission.id}
                        className={cn(
                          "text-sm font-medium cursor-pointer",
                          permission.value && isEnabled
                            ? "text-white"
                            : "text-gray-400",
                        )}
                      >
                        {permission.label}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {permission.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Permission Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-400">
                {permissions.filter((p) => p.value).length} de{" "}
                {permissions.length} permisos activos
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Última modificación: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
