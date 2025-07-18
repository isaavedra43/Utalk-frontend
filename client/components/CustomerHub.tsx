import { useState, useEffect, useMemo } from "react";
import { ContactTable } from "./ContactTable";
import { ContactCards } from "./ContactCards";
import { ContactForm } from "./ContactForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  Grid3X3, 
  Plus, 
  Filter, 
  Download, 
  Search, 
  Upload,
  RefreshCw,
  AlertCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { 
  useContacts, 
  useContactStats, 
  useContactTags,
  useExportContacts,
  useImportContacts,
  contactsKeys,
} from "@/hooks/useContacts";
import type { Contact } from "@shared/api";
import type { ContactsListRequest } from "@shared/api";
import { useQueryClient } from "@tanstack/react-query";

interface CustomerHubProps {
  className?: string;
}

export function CustomerHub({ className }: CustomerHubProps) {
  // const { user } = useAuth(); // TODO: Usar cuando se implemente autenticación
  const queryClient = useQueryClient();
  
  // Estados locales para filtros y UI
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus] = useState<string>("");
  const [selectedChannel] = useState<string>("");
  const [selectedOwner] = useState<string>("");
  const [sortBy] = useState<'name' | 'email' | 'createdAt' | 'lastInteraction'>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Estados para ContactForm
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  // Construir filtros para la API
  const filters: ContactsListRequest = useMemo(() => ({
    page: currentPage,
    limit: 50,
    search: searchTerm || undefined,
    status: selectedStatus as any || undefined,
    channel: selectedChannel as any || undefined,
    owner: selectedOwner || undefined,
    sortBy,
    sortOrder,
  }), [currentPage, searchTerm, selectedStatus, selectedChannel, selectedOwner, sortBy, sortOrder]);

  // Hooks de datos reales
  const { 
    data: contactsData, 
    isLoading: isLoadingContacts, 
    error: contactsError,
    refetch: refetchContacts 
  } = useContacts(filters);

  const { 
    data: statsData, 
    isLoading: isLoadingStats 
  } = useContactStats();

  // const { 
  //   data: tagsData 
  // } = useContactTags(); // TODO: Usar cuando se implemente funcionalidad de tags

  const exportMutation = useExportContacts();
  const importMutation = useImportContacts();

  // Efecto para resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedChannel, selectedOwner]);

  // Handlers para operaciones (ContactForm)
  const handleCreateContact = () => {
    setContactToEdit(null);
    setIsFormOpen(true);
  };

  const handleRefresh = () => {
    refetchContacts();
    queryClient.invalidateQueries({ queryKey: contactsKeys.stats() });
    queryClient.invalidateQueries({ queryKey: contactsKeys.tags() });
  };

  const handleFilter = () => {
    console.log("Abriendo panel de filtros avanzados...");
    // TODO: Implementar modal de filtros avanzados
  };

  const handleExportCSV = async () => {
    try {
      await exportMutation.mutateAsync({ 
        format: 'csv', 
        filters 
      });
    } catch (error: any) {
      console.error('Error al exportar:', error);
    }
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importMutation.mutateAsync({ 
            file,
            skipDuplicates: true,
            updateExisting: false 
          });
        } catch (error: any) {
          console.error('Error al importar:', error);
        }
      }
    };
    input.click();
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContact(contactId);
    console.log(`Contacto seleccionado: ${contactId}`);
  };

  // Funciones adicionales para el ContactForm

  const handleEditContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setContactToEdit(contact);
      setIsFormOpen(true);
    }
  };

  const handleFormSuccess = () => {
    // Refrescar datos después de crear/editar
    refetchContacts();
    queryClient.invalidateQueries({ queryKey: contactsKeys.stats() });
  };

  const handleSendCampaign = (contactId: string) => {
    console.log(`Enviando campaña a contacto: ${contactId}`);
    // TODO: Implementar modal de campaña
  };

  const handleDeleteContact = (contactId: string) => {
    console.log(`Eliminando contacto: ${contactId}`);
    // TODO: Implementar confirmación y eliminación
  };

  // Estados de carga y error
  const isLoading = isLoadingContacts || isLoadingStats;
  const hasError = !!contactsError;
  const contacts = contactsData?.contacts || [];
  const pagination = contactsData?.pagination;
  const stats = statsData;

  // Renderizar error si hay problema de conexión
  if (hasError && !isLoading) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-gray-950", className)}>
        <div className="text-center text-gray-400 p-8">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium mb-2 text-white">Error al cargar contactos</h3>
          <p className="text-sm mb-4">
            {(contactsError as any)?.response?.data?.message || 'No se pudo conectar con el servidor'}
          </p>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex bg-gray-950", className)}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900 px-0 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-xl font-semibold text-white"
                style={{ marginLeft: "13px" }}
              >
                Customer Hub
              </h1>
              <p
                className="text-sm text-gray-400"
                style={{ marginLeft: "13px" }}
              >
                {isLoading ? 'Cargando...' : `${contacts.length} contactos`}
                {pagination && ` de ${pagination.total} total`}
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3" style={{ marginRight: "13px" }}>
              {/* Stats badges */}
              {stats && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {stats.byStatus?.customer || 0} clientes
                  </Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {stats.byStatus?.lead || 0} leads
                  </Badge>
                </div>
              )}

              <Button
                onClick={() => setViewMode("table")}
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "transition-all",
                  viewMode === "table"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700"
                )}
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode("cards")}
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "transition-all",
                  viewMode === "cards"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-600 text-gray-300 hover:bg-gray-700"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex items-center gap-3" style={{ marginLeft: "13px" }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contactos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-800 border-gray-600 text-white w-64"
                />
              </div>

              <Button
                onClick={handleFilter}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2" style={{ marginRight: "13px" }}>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Actualizar
              </Button>

              <Button
                onClick={handleImportCSV}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={importMutation.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>

              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>

              <Button
                onClick={handleCreateContact}
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Contacto
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Estado vacío */}
          {!isLoading && contacts.length === 0 && !searchTerm && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400 p-8">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2 text-white">No hay contactos</h3>
                <p className="text-sm mb-4">Comienza agregando tu primer contacto</p>
                <Button
                  onClick={handleCreateContact}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Contacto
                </Button>
              </div>
            </div>
          )}

          {/* Estado sin resultados de búsqueda */}
          {!isLoading && contacts.length === 0 && searchTerm && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400 p-8">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2 text-white">Sin resultados</h3>
                <p className="text-sm mb-4">No se encontraron contactos para "{searchTerm}"</p>
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Limpiar búsqueda
                </Button>
              </div>
            </div>
          )}

          {/* Lista de contactos */}
          {(contacts.length > 0 || isLoading) && (
            <>
              {viewMode === "table" ? (
                <ContactTable
                  contacts={contacts}
                  selectedContactId={selectedContact}
                  onSelectContact={handleSelectContact}
                  onEditContact={handleEditContact}
                  onDeleteContact={handleDeleteContact}
                  onSendCampaign={handleSendCampaign}
                  isLoading={isLoading}
                  pagination={pagination}
                  onPageChange={setCurrentPage}
                />
              ) : (
                <ContactCards
                  contacts={contacts}
                  selectedContactId={selectedContact}
                  onSelectContact={handleSelectContact}
                  onEditContact={handleEditContact}
                  onDeleteContact={handleDeleteContact}
                  onSendCampaign={handleSendCampaign}
                  isLoading={isLoading}
                  pagination={pagination}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactForm
        contact={contactToEdit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
