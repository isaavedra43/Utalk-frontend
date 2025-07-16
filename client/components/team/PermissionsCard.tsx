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
import type { Seller } from "@/types/api";

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

  const allPermissions = [
    {
      key: "read",
      label: "Leer",
      description: "Ver conversaciones, contactos y reportes",
      value: seller.permissions.read,
    },
    {
      key: "write",
      label: "Escribir",
      description: "Enviar mensajes, crear contactos y editar campañas",
      value: seller.permissions.write,
    },
    {
      key: "approve",
      label: "Aprobar",
      description: "Aprobar campañas y acciones masivas",
      value: seller.permissions.approve,
    },
    {
      key: "admin",
      label: "Administrar",
      description: "Gestionar equipo, configuraciones y facturación",
      value: seller.permissions.admin,
    },
  ];

  const handleToggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    onToggleEnabled(enabled);
  };

  const handlePermissionChange = (key: string, value: boolean) => {
    onPermissionChange(key, value);
  };

  const getPermissionLevel = () => {
    const enabledPermissions = allPermissions.filter((p) => p.value).length;
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
          {allPermissions.map((permission) => (
            <div
              key={permission.key}
              className="flex items-start justify-between"
            >
              <div className="flex-1 mr-4">
                <p className="font-semibold text-white">{permission.label}</p>
                <p className="text-sm text-gray-400">
                  {permission.description}
                </p>
              </div>
              <Switch
                checked={permission.value}
                onCheckedChange={(checked) =>
                  handlePermissionChange(permission.key, checked)
                }
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-600"
              />
            </div>
          ))}
        </div>

        {/* Permission Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-400">
                {allPermissions.filter((p) => p.value).length} de{" "}
                {allPermissions.length} permisos activos
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
