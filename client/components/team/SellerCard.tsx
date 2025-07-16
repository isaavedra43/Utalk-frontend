import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  UserX,
  CheckCircle,
  XCircle,
  FileText,
  Edit3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seller } from "@/types/api";

interface SellerCardProps {
  seller: Seller;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
}

export function SellerCard({
  seller,
  isSelected,
  onSelect,
  onEdit,
  onDeactivate,
}: SellerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const permissions = [];
  if (seller.permissions.read) permissions.push("📋 Leer");
  if (seller.permissions.write) permissions.push("✏️ Escribir");
  if (seller.permissions.approve) permissions.push("✅ Aprobar");
  if (seller.permissions.admin) permissions.push("⚙️ Admin");

  const getStatusColor = () => {
    switch (seller.status) {
      case "active":
        return "bg-green-900/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-red-900/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div
      className={cn(
        "bg-gray-800/50 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-800/70 hover:border-gray-600 hover:shadow-lg hover:shadow-gray-900/20",
        isSelected &&
          "border-2 border-blue-500 bg-gray-800/70 shadow-lg shadow-blue-500/10",
      )}
      onClick={onSelect}
    >
      {/* Header with Avatar and Menu */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-600">
                <span className="text-white text-sm font-bold">
                  {getInitials(seller.name)}
                </span>
              </div>
            )}
            {/* Status Indicator */}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 flex items-center justify-center",
                seller.status === "active" ? "bg-green-500" : "bg-red-500",
              )}
            >
              {seller.status === "active" ? (
                <CheckCircle className="w-2 h-2 text-white" />
              ) : (
                <XCircle className="w-2 h-2 text-white" />
              )}
            </div>
          </div>

          {/* Name and Role */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">
              {seller.name}
            </h3>
            <p className="text-gray-400 text-xs truncate">{seller.role}</p>
          </div>
        </div>

        {/* Context Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-gray-800 border-gray-700"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDeactivate();
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <UserX className="h-4 w-4 mr-2" />
              {seller.status === "active" ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <Badge
          className={cn(
            "border text-xs",
            getStatusColor(),
          )}
        >
          {seller.status === "active" ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Permissions Summary */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Permisos
        </p>
        <div className="flex flex-wrap gap-1">
          {permissions.map((permission, index) => (
            <span
              key={index}
              className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded"
            >
              {permission}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Stats Preview */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500">Chats</p>
            <p className="text-sm font-semibold text-white">
              {seller.kpis.chatsAttended}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">CSAT</p>
            <p className="text-sm font-semibold text-yellow-400">
              {seller.kpis.csatScore}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Conv.</p>
            <p className="text-sm font-semibold text-green-400">
              {seller.kpis.conversionRate}%
            </p>
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-3 pt-2 border-t border-blue-500/30">
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium">Seleccionado</span>
          </div>
        </div>
      )}
    </div>
  );
}
