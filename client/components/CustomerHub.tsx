import { useState, useEffect } from "react";
import { PerformanceKPIs } from "./PerformanceKPIs";
import { ContactTable } from "./ContactTable";
import { ContactCards } from "./ContactCards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, Grid3X3, Plus, Filter, Download, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContacts, useCreateContact, useDeleteContact, useExportContacts } from "@/hooks/useContacts";
import { toast } from "@/hooks/use-toast";
import type { Contact as ApiContact } from "@/types/api";

// Usar el tipo de la API
export type Contact = ApiContact;

interface CustomerHubProps {
  className?: string;
}

export default function CustomerHub({ className }: CustomerHubProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentView, setCurrentView] = useState<"table" | "cards">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  // Hooks de React Query
  const { 
    data: contactsResponse, 
    isLoading, 
    error 
  } = useContacts({
    page: currentPage,
    pageSize: 50,
    search: searchTerm || undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const createContactMutation = useCreateContact();
  const deleteContactMutation = useDeleteContact();
  const exportContactsMutation = useExportContacts();

  const contacts = contactsResponse?.data || [];
  const totalContacts = contactsResponse?.pagination?.total || 0;

  // KPIs calculados de los datos reales
  const kpiData = {
    totalContacts,
    newLeads: contacts.filter(c => c.status === "new-lead").length,
    hotLeads: contacts.filter(c => c.status === "hot-lead").length,
    customers: contacts.filter(c => c.status === "customer").length,
  };

  // Handlers para acciones
  const handleCreateContact = () => {
    toast({
      title: "Crear contacto",
      description: "Funcionalidad de creación de contacto estará disponible pronto.",
    });
    // TODO: Abrir modal de creación de contacto
  };

  const handleFilter = () => {
    setShowFilter(!showFilter);
    if (!showFilter) {
      toast({
        title: "Filtros avanzados",
        description: "Panel de filtros avanzados estará disponible pronto.",
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportContactsMutation.mutateAsync('csv');
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleEditContact = (contactId: string) => {
    toast({
      title: "Editar contacto",
      description: `Abriendo editor para contacto ID: ${contactId}`,
    });
    // TODO: Abrir modal de edición con datos del contacto
  };

  const handleSendCampaign = (contactId: string) => {
    toast({
      title: "Enviar campaña",
      description: `Preparando campaña para contacto ID: ${contactId}`,
    });
    // TODO: Navegar al módulo de campañas con el contacto preseleccionado
  };

  const handleDeleteContact = async (contactId: string) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este contacto?");
    if (confirmed) {
      try {
        await deleteContactMutation.mutateAsync(contactId);
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // Filtrado local adicional si es necesario
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-4">Error al cargar los contactos</p>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-gray-950 text-white overflow-hidden", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Customer Hub</h1>
            <p className="text-gray-400 text-sm mt-1">
              {isLoading ? "Cargando..." : `${totalContacts} contactos en total`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateContact}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createContactMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Contacto
            </Button>
            <Button
              variant="outline"
              onClick={handleFilter}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={exportContactsMutation.isPending}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              {exportContactsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <PerformanceKPIs 
          data={kpiData}
          isLoading={isLoading}
        />

        {/* Search and View Toggle */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contactos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 w-80"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { value: "all", label: "Todos" },
                { value: "new-lead", label: "New Lead" },
                { value: "hot-lead", label: "Hot Lead" },
                { value: "payment", label: "Payment" },
                { value: "customer", label: "Customer" },
              ].map((status) => (
                <Badge
                  key={status.value}
                  variant={selectedStatus === status.value ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedStatus === status.value
                      ? "bg-blue-600 text-white"
                      : "border-gray-600 text-gray-300 hover:bg-gray-800"
                  )}
                  onClick={() => setSelectedStatus(status.value)}
                >
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("table")}
              className={cn(
                "px-3 py-2",
                currentView === "table"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("cards")}
              className={cn(
                "px-3 py-2",
                currentView === "cards"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-gray-400">Cargando contactos...</p>
            </div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                {searchTerm || selectedStatus !== "all" 
                  ? "No se encontraron contactos con los filtros aplicados"
                  : "No hay contactos disponibles"
                }
              </p>
              {(searchTerm || selectedStatus !== "all") && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        ) : currentView === "table" ? (
          <ContactTable
            contacts={filteredContacts}
            isLoading={isLoading}
            onEditContact={handleEditContact}
            onSendCampaign={handleSendCampaign}
            onDeleteContact={handleDeleteContact}
          />
        ) : (
          <ContactCards
            contacts={filteredContacts}
            isLoading={isLoading}
            onEditContact={handleEditContact}
            onSendCampaign={handleSendCampaign}
            onDeleteContact={handleDeleteContact}
          />
        )}
      </div>
    </div>
  );
}
