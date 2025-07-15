import { useState, useEffect } from "react";
import { SellerList } from "./team/SellerList";
import { SellerDetail } from "./team/SellerDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Users, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamMembers, useCreateTeamMember, type TeamMember } from "@/hooks/useTeam";
import { toast } from "@/hooks/use-toast";

export interface Seller extends TeamMember {} // Compatibilidad hacia atrás

interface EquipoPerformanceProps {
  className?: string;
}

export function EquipoPerformance({ className }: EquipoPerformanceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<TeamMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Hooks para datos reales
  const { 
    data: teamResponse, 
    isLoading, 
    error,
    refetch 
  } = useTeamMembers({
    page: currentPage,
    search: searchTerm,
    status: 'active'
  });

  const createMemberMutation = useCreateTeamMember();

  const teamMembers = teamResponse?.data || [];
  const totalMembers = teamResponse?.pagination?.total || 0;

  // Seleccionar primer miembro por defecto
  useEffect(() => {
    if (!selectedSeller && teamMembers.length > 0) {
      setSelectedSeller(teamMembers[0]);
    }
  }, [teamMembers, selectedSeller]);

  // Filtrado local (opcional, ya que el backend puede manejar búsqueda)
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = teamMembers.filter(m => m.status === "active").length;
  const inactiveCount = teamMembers.filter(m => m.status === "inactive").length;

  const handleAddMember = () => {
    toast({
      title: "Agregar miembro",
      description: "La funcionalidad de agregar miembro estará disponible pronto.",
    });
    // TODO: Abrir modal de creación de miembro
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Datos actualizados",
      description: "La información del equipo ha sido refrescada.",
    });
  };

  // Loading state
  if (isLoading && teamMembers.length === 0) {
    return (
      <div className={cn("h-full bg-gray-950 text-white p-6", className)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <div className="flex gap-6 h-[600px]">
            <Skeleton className="w-1/3 h-full" />
            <Skeleton className="w-2/3 h-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("h-full bg-gray-950 text-white p-6 flex items-center justify-center", className)}>
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar el equipo</h3>
          <p className="text-gray-400 mb-4">No se pudieron obtener los datos del equipo</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full bg-gray-950 text-white overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Equipo</h1>
            <p className="text-gray-400 text-sm mt-1">
              {totalMembers} miembros en total • {activeCount} activos • {inactiveCount} inactivos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="h-10"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Actualizar
            </Button>
            
            <Button
              onClick={handleAddMember}
              size="sm"
              disabled={createMemberMutation.isPending}
              className="h-10"
            >
              {createMemberMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Agregar Miembro
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 border-b border-gray-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Miembros</p>
                <p className="text-white text-xl font-bold">{totalMembers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Activos</p>
                <p className="text-white text-xl font-bold">{activeCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">○</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Inactivos</p>
                <p className="text-white text-xl font-bold">{inactiveCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">%</span>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Performance Avg</p>
                <p className="text-white text-xl font-bold">
                  {teamMembers.length > 0 
                    ? Math.round(teamMembers.reduce((acc, m) => acc + (m.performance?.conversionRate || 0), 0) / teamMembers.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Team List */}
        <div className="w-1/3 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Miembros del Equipo</h2>
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                {filteredMembers.length}
              </Badge>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <SellerList
                sellers={filteredMembers}
                selectedSeller={selectedSeller}
                onSelectSeller={setSelectedSeller}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Selected Member Details */}
        <div className="flex-1 flex flex-col">
          {selectedSeller ? (
            <SellerDetail seller={selectedSeller} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Selecciona un miembro del equipo
                </h3>
                <p className="text-gray-400">
                  Elige un miembro de la lista para ver sus detalles y performance
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
