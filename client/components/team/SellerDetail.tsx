import type { Seller } from "@/types/api";
import { KpiGrid } from "./KpiGrid";
import { TrendCharts } from "./TrendCharts";
import { PermissionsCard } from "./PermissionsCard";
import { IaActions } from "./IaActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface SellerDetailProps {
  seller: Seller;
}

export function SellerDetail({ seller }: SellerDetailProps) {
  const getInitials = (name: string) => (
    name.split(' ').map(n => n[0]).join('').toUpperCase()
  );

  const handlePermissionChange = (permission: string, value: boolean) => {
    console.log(`Permission ${permission} for ${seller.name} changed to ${value}`);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    console.log(`Seller ${seller.name} status changed to ${enabled ? 'active' : 'inactive'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header del Vendedor */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-4 border-gray-700">
            <AvatarImage src={seller.avatar} alt={seller.name} />
            <AvatarFallback className="text-2xl bg-gray-600">
                {getInitials(seller.name)}
            </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{seller.name}</h1>
            <Badge className={seller.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
              {seller.status}
            </Badge>
          </div>
          <p className="text-lg text-gray-400">{seller.role}</p>
          <p className="text-sm text-gray-500">{seller.email}</p>
        </div>
        <Button variant="outline" className="ml-auto">
          <Edit className="h-4 w-4 mr-2" />
          Editar Perfil
        </Button>
      </div>

      {/* Grilla de KPIs */}
      <KpiGrid seller={seller} />

      {/* Gráficos de Tendencias */}
      <TrendCharts seller={seller} />

      {/* Permisos */}
      <PermissionsCard 
        seller={seller}
        onPermissionChange={handlePermissionChange}
        onToggleEnabled={handleToggleEnabled}
      />
      
      {/* Acciones de IA */}
      <IaActions seller={seller} />

    </div>
  );
}
