import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, PlusCircle, Filter } from "lucide-react";
import { ContactForm } from "./ContactForm"; 
import { useContacts, useDeleteContact } from "@/hooks/useContacts";
import { useDebounce } from "@/hooks/useDebounce";
import type { Contact } from "@/types/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function CustomerHub({ className }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Obtener contactos
  const { data: contactsResponse, isLoading, error } = useContacts({
    search: debouncedSearchTerm
  });
  
  const contacts = contactsResponse?.data || [];
  const deleteContactMutation = useDeleteContact();

  const handleEditContact = (contactId: string) => {
    const contact = Array.isArray(contacts) ? contacts.find(c => c.id === contactId) : null;
    if (contact) {
      setSelectedContact(contact);
      setIsFormOpen(true);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteContactMutation.mutateAsync(contactId);
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
    }
  };

  const handleSendCampaign = (contactId: string) => {
    // TODO: Implementar envío de campaña
    console.log('Enviando campaña a contacto:', contactId);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Error al cargar contactos
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Contactos</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Contacto
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Cargando contactos...</div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">No se encontraron contactos</div>
          </div>
        ) : Array.isArray(contacts) && contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <h3 className="font-semibold text-white mb-2">{contact.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{contact.phone}</p>
                {contact.email && (
                  <p className="text-gray-400 text-sm mb-3">{contact.email}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditContact(contact.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Contact Form Modal */}
      {isFormOpen && <div>Form placeholder</div>}
    </div>
  );
}
