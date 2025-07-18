import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area"; // TODO: Usar cuando se implemente scroll
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Send,
  Trash2,
  // MessageCircle, // TODO: Usar cuando se implemente funcionalidad de mensajes
  Mail,
  Phone,
  // Calendar, // TODO: Usar cuando se implemente funcionalidad de calendario
  ChevronLeft,
  ChevronRight,
  // Clock, // TODO: Usar cuando se implemente funcionalidad de tiempo
  Users,
  // Search, // TODO: Usar cuando se implemente funcionalidad de búsqueda
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact, ContactsListResponse } from "@shared/api";

interface ContactCardsProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onEditContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onSendCampaign: (contactId: string) => void;
  isLoading: boolean;
  pagination?: ContactsListResponse['pagination'];
  onPageChange?: (page: number) => void;
}

// Channel icons and colors - Migrado a nuevos tipos globales
const channelIcons = {
  whatsapp: MessageSquare,
  facebook: MessageSquare,
  instagram: MessageSquare,
  telegram: MessageSquare,
  email: Mail,
  phone: Phone,
  web: MessageSquare,
};

const channelColors = {
  whatsapp: "text-green-400",
  facebook: "text-blue-400",
  instagram: "text-pink-400",
  telegram: "text-blue-500",
  email: "text-gray-400",
  phone: "text-purple-400",
  web: "text-gray-400",
};

const channelNames = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "Email",
  phone: "Teléfono",
  web: "Web",
};

// Status colors and labels - Migrado a nuevos tipos globales
const statusColors = {
  "lead": "bg-blue-600 text-white",
  "customer": "bg-green-600 text-white",
  "inactive": "bg-gray-600 text-white",
};

const statusLabels = {
  "lead": "Lead",
  "customer": "Cliente",
  "inactive": "Inactivo",
};

// Format date function
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.round(diffInHours * 60)} min`;
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return "Ayer";
    } else {
      return date.toLocaleDateString();
    }
  } catch {
    return dateString;
  }
};

export function ContactCards({
  contacts,
  selectedContactId,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onSendCampaign,
  isLoading,
  pagination,
  onPageChange,
}: ContactCardsProps) {

  // Skeleton loader para estado de carga
  const SkeletonCard = () => (
    <div className="bg-[#252535] border border-[#333] rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-4 w-24 bg-gray-700" />
        <Skeleton className="h-4 w-16 bg-gray-700" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-full bg-gray-700" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2 bg-gray-700" />
          <Skeleton className="h-3 w-24 bg-gray-700" />
        </div>
      </div>
      <Skeleton className="h-16 w-full mb-3 bg-gray-700" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20 bg-gray-700" />
        <div className="flex gap-1">
          <Skeleton className="h-7 w-7 bg-gray-700" />
          <Skeleton className="h-7 w-7 bg-gray-700" />
          <Skeleton className="h-7 w-7 bg-gray-700" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-950 overflow-hidden flex flex-col">
      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-3" style={{ padding: "12px", minHeight: "100%" }}>
          {isLoading ? (
            // Mostrar skeletons mientras carga
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              style={{ gap: "12px" }}
            >
              {Array.from({ length: 15 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            // Estado vacío
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400 p-8">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2 text-white">No hay contactos</h3>
                <p className="text-sm">Los contactos aparecerán aquí cuando se agreguen</p>
              </div>
            </div>
          ) : (
            // Mostrar contactos reales
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              style={{ gap: "12px", padding: "0" }}
            >
              {contacts.map((contact) => {
                const ChannelIcon = channelIcons[contact.channel];
                const isSelected = selectedContactId === contact.id;

                return (
                  <div
                    key={contact.id}
                    className={cn(
                      "bg-[#252535] border border-[#333] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-[#2E2E42] hover:border-gray-600",
                      isSelected && "border-2 border-[#3178C6] bg-[#2E2E42]",
                    )}
                    onClick={() => onSelectContact(contact.id)}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-[#AAA] text-sm">
                          {statusLabels[contact.status]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#CCC] text-sm">
                          {formatDate(contact.createdAt)}
                        </span>
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>

                    {/* Avatar + Name + Channel */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative flex-shrink-0">
                        {contact.avatarUrl ? (
                          <img
                            src={contact.avatarUrl}
                            alt={`${contact.firstName} ${contact.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-white text-lg font-medium">
                              {contact.firstName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#252535] rounded-full flex items-center justify-center border border-gray-700">
                          <ChannelIcon
                            className={cn("w-3 h-3", channelColors[contact.channel])}
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-base font-medium truncate">
                          {`${contact.firstName} ${contact.lastName}`}
                        </h3>
                        <p className={cn("text-sm font-medium", channelColors[contact.channel])}>
                          {channelNames[contact.channel]}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {contact.email}
                        </p>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{contact.phone}</span>
                      </div>
                      {contact.company && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-3 h-3" />
                          <span className="truncate">{contact.company}</span>
                        </div>
                      )}
                      {contact.notes && (
                        <div className="text-sm text-gray-300 bg-gray-800/50 rounded p-2 mt-2">
                          <p className="truncate">{contact.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {contact.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            className="text-xs bg-gray-700 text-gray-300 border-gray-600"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {contact.tags.length > 2 && (
                          <Badge className="text-xs bg-gray-700 text-gray-300 border-gray-600">
                            +{contact.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      {/* Status Badge */}
                      <Badge className={cn("text-xs", statusColors[contact.status])}>
                        {statusLabels[contact.status]}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContact(contact.id);
                          }}
                          size="sm"
                          className="h-7 w-7 p-0 bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendCampaign(contact.id);
                          }}
                          size="sm"
                          className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContact(contact.id);
                          }}
                          size="sm"
                          className="h-7 w-7 p-0 bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* AI Score indicator */}
                    {contact.aiScore && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          AI: {contact.aiScore}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && !isLoading && (
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
              {pagination.total} contactos
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-300 px-3">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <Button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!pagination.hasNext}
                size="sm"
                className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
