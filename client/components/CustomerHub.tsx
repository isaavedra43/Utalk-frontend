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
import { ContactTable } from "./ContactTable";
import { ContactCards } from "./ContactCards";
import { ContactForm } from "./ContactForm"; 
import { useContacts, useDeleteContact } from "@/hooks/useContacts";
import { useDebounce } from "@/hooks/useDebounce";
import type { Contact } from "@/types/api";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function CustomerHub({ className }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [currentView, setCurrentView] = useState<"table" | "cards">("table");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    ['contacts', debouncedSearchTerm],
    ({ pageParam }) => useContacts({ search: debouncedSearchTerm, cursor: pageParam }),
    {
      getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor,
    }
  );
  
  const deleteContactMutation = useDeleteContact();

  const allContacts = data?.pages.flatMap(page => page.data) || [];
  
  const handleCreate = () => {
    setSelectedContact(null);
    setIsFormOpen(true);
  };
  
  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsFormOpen(true);
  };
  
  const handleDelete = (contactId: string) => {
    deleteContactMutation.mutate(contactId);
  };
  
  const handleSave = () => {
    setIsFormOpen(false);
    setSelectedContact(null);
    // Invalida y recarga los datos
  };

  if (isFormOpen) {
    return <ContactForm contact={selectedContact} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />;
  }
  
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">CRM / Contactos</h1>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Contacto
        </Button>
      </div>
      
       <div className="flex justify-between items-center mb-4">
        <Input 
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-xs"
        />
         {/* Aquí irían más filtros */}
      </div>

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="flex-1 overflow-auto">
            {currentView === 'table' ? (
                <ContactTable contacts={allContacts} onEdit={handleEdit} onDelete={handleDelete} />
            ) : (
                <ContactCards contacts={allContacts} onEdit={handleEdit} onDelete={handleDelete} />
            )}
            
            {hasNextPage && (
                <div className="text-center mt-4">
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
                    </Button>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
