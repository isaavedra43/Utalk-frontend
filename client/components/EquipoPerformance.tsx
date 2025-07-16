import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Loader2, UserPlus, RefreshCw, Search } from "lucide-react";

import { useTeamMembers, useCreateTeamMember } from "@/hooks/useTeam";
import { SellerList } from "./team/SellerList";
import { SellerDetail } from "./team/SellerDetail";
import type { Seller } from "@/types/api";

export function EquipoPerformance({ className }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: teamResponse, isLoading, error, refetch } = useTeamMembers({
    page: currentPage,
    search: searchTerm,
    status: "active",
  });
  
  const teamMembers = teamResponse?.data || [];
  const pagination = teamResponse?.pagination;

  useEffect(() => {
    if (!selectedSeller && teamMembers.length > 0) {
      setSelectedSeller(teamMembers[0]);
    }
  }, [teamMembers, selectedSeller]);

  const handleSelectSeller = (seller: Seller) => {
    setSelectedSeller(seller);
  };
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Datos actualizados",
      description: "La información del equipo ha sido refrescada.",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error al cargar el equipo.
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Columna Izquierda: Lista de Vendedores */}
      <div className="w-1/3 border-r border-gray-800 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Equipo</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
        
        {isLoading && !teamResponse ? (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : (
            <SellerList
                sellers={teamMembers}
                selectedSeller={selectedSeller}
                onSelectSeller={handleSelectSeller}
            />
        )}
        
        {/* Paginación */}
        <div className="mt-auto pt-4">
             <div className="flex justify-between items-center text-sm text-gray-400">
                <p>Página {pagination?.page} de {pagination?.totalPages}</p>
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination || pagination.page <= 1}
                    >
                        Anterior
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination || pagination.page >= pagination.totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
      </div>

      {/* Columna Derecha: Detalles del Vendedor */}
      <div className="w-2/3 p-6 overflow-y-auto">
        {selectedSeller ? (
          <SellerDetail seller={selectedSeller} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center bg-gray-800 border-gray-700">
              <h3 className="text-lg font-semibold">Selecciona un Vendedor</h3>
              <p className="text-gray-400">
                Elige un vendedor de la lista para ver sus detalles y métricas de rendimiento.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
