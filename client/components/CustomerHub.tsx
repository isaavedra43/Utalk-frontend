import { useState, useEffect } from "react";
import { PerformanceKPIs } from "./PerformanceKPIs";
import { ContactTable } from "./ContactTable";
import { ContactCards } from "./ContactCards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, Grid3X3, Plus, Filter, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Contact {
  id: string;
  owner: string;
  name: string;
  email: string;
  phone: string;
  status: "new-lead" | "hot-lead" | "payment" | "customer";
  lastMessage: string;
  timestamp: string;
  date: string;
  channel: "whatsapp" | "email" | "sms" | "facebook" | "instagram";
  section: string;
  isUnread: boolean;
  avatarUrl?: string;
  sentiment?: "positive" | "negative" | "neutral";
  aiScore?: number;
}

// Mock data
const mockContacts: Contact[] = [
  {
    id: "1",
    owner: "María García",
    name: "Israel Saavedra",
    email: "israel@example.com",
    phone: "+52 555 123 4567",
    status: "new-lead",
    lastMessage: "Hola, ¿cómo está el estado de mi pedido #AL-2024-0123?",
    timestamp: "12:14 PM",
    date: "2024-01-15",
    channel: "facebook",
    section: "New Lead",
    isUnread: true,
    sentiment: "neutral",
    aiScore: 75,
    avatarUrl:
      "https://cdn.builder.io/api/v1/image/assets%2F2d1f4aff150c46d2aa10d890d5bc0fca%2Fac493c187ef4459383661e17488cac3a?format=webp&width=800",
  },
  {
    id: "2",
    owner: "Carlos López",
    name: "Ana Morales",
    email: "ana.morales@company.com",
    phone: "+52 555 987 6543",
    status: "hot-lead",
    lastMessage: "Me interesa mucho el producto, ¿cuándo podemos hablar?",
    timestamp: "11:30 AM",
    date: "2024-01-15",
    channel: "whatsapp",
    section: "Hot Lead",
    isUnread: true,
    sentiment: "positive",
    aiScore: 92,
  },
  {
    id: "3",
    owner: "Luis Hernández",
    name: "Roberto Silva",
    email: "roberto@email.com",
    phone: "+52 555 456 7890",
    status: "payment",
    lastMessage: "Ya realicé el pago, envío confirmación por email",
    timestamp: "Yesterday",
    date: "2024-01-14",
    channel: "email",
    section: "Payment",
    isUnread: false,
    sentiment: "positive",
    aiScore: 95,
  },
  {
    id: "4",
    owner: "Sofia Martinez",
    name: "Carmen González",
    email: "carmen@example.com",
    phone: "+52 555 321 6547",
    status: "customer",
    lastMessage: "Gracias por el excelente servicio",
    timestamp: "2 days ago",
    date: "2024-01-13",
    channel: "sms",
    section: "Customer",
    isUnread: false,
    sentiment: "positive",
    aiScore: 88,
  },
];

interface CustomerHubProps {
  className?: string;
}

export function CustomerHub({ className }: CustomerHubProps) {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter contacts based on search
  const getFilteredContacts = () => {
    let filtered = mockContacts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone.includes(searchTerm),
      );
    }

    return filtered;
  };

  // Event handlers

  const handleCreateContact = () => {
    console.log("Creating new contact...");
    // TODO: Open modal for creating contact
  };

  const handleFilter = () => {
    console.log("Opening filter panel...");
    // TODO: Open advanced filter modal
  };

  const handleExportCSV = () => {
    console.log("Exporting contacts to CSV...");
    // TODO: Generate and download CSV
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContact(contactId);
    console.log(`Selected contact: ${contactId}`);
  };

  const handleEditContact = (contactId: string) => {
    console.log(`Editing contact: ${contactId}`);
    // TODO: Open edit modal
  };

  const handleSendCampaign = (contactId: string) => {
    console.log(`Sending campaign to contact: ${contactId}`);
    // TODO: Open campaign modal
  };

  const handleDeleteContact = (contactId: string) => {
    console.log(`Deleting contact: ${contactId}`);
    // TODO: Show confirmation and delete
  };

  const filteredContacts = getFilteredContacts();

  return (
    <div className={cn("h-full flex bg-gray-950", className)}>
      {/* Performance KPIs Sidebar */}
      <PerformanceKPIs />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Customer Hub</h1>
              <p className="text-sm text-gray-400">
                {filteredContacts.length} contacts
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === "table" ? "default" : "ghost"}
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-8 px-3",
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                <Table className="h-4 w-4 mr-1" />
                Tabla
              </Button>
              <Button
                size="sm"
                variant={viewMode === "cards" ? "default" : "ghost"}
                onClick={() => setViewMode("cards")}
                className={cn(
                  "h-8 px-3",
                  viewMode === "cards"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white",
                )}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Tarjetas
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateContact}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Contacto
              </Button>
              <Button
                variant="outline"
                onClick={handleFilter}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contactos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* AI Actions Bar */}
        <AIActions
          isLoading={isLoading}
          onAIAction={handleAIAction}
          selectedContactId={selectedContact}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "table" ? (
            <ContactTable
              contacts={filteredContacts}
              selectedContactId={selectedContact}
              onSelectContact={handleSelectContact}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
              onSendCampaign={handleSendCampaign}
              isLoading={isLoading}
            />
          ) : (
            <ContactCards
              contacts={filteredContacts}
              selectedContactId={selectedContact}
              onSelectContact={handleSelectContact}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
              onSendCampaign={handleSendCampaign}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
