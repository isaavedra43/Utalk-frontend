import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Send,
  Trash2,
  MessageCircle,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact, ContactsListResponse } from "@shared/api";

interface ContactTableProps {
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

type SortField = "owner" | "name" | "email" | "status" | "createdAt";
type SortDirection = "asc" | "desc";

// Channel icons and colors
const channelIcons = {
  whatsapp: MessageSquare,
  facebook: MessageSquare,
  instagram: MessageSquare,
  telegram: MessageSquare,
  email: Mail,
  phone: MessageSquare,
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

// Status colors and labels
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

export function ContactTable({
  contacts,
  selectedContactId,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onSendCampaign,
  isLoading,
  pagination,
  onPageChange,
}: ContactTableProps) {
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-400" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-400" />
    );
  };

  const handleRowClick = (contactId: string) => {
    onSelectContact(contactId);
    setExpandedRow(expandedRow === contactId ? null : contactId);
  };

  // Skeleton loader para estado de carga
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32 bg-gray-700" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40 bg-gray-700" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48 bg-gray-700" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28 bg-gray-700" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24 bg-gray-700" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16 bg-gray-700" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
      <TableCell><Skeleton className="h-8 w-24 bg-gray-700" /></TableCell>
    </TableRow>
  );

  return (
    <div className="flex-1 bg-gray-950 overflow-hidden flex flex-col">
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead
                className="text-gray-300 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("owner")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "140px",
                }}
              >
                <div className="flex items-center gap-2">
                  Propietario
                  {renderSortIcon("owner")}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("name")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "180px",
                }}
              >
                <div className="flex items-center gap-2">
                  Contacto
                  {renderSortIcon("name")}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("email")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "200px",
                }}
              >
                <div className="flex items-center gap-2">
                  Email
                  {renderSortIcon("email")}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 whitespace-nowrap"
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "140px",
                }}
              >
                Teléfono
              </TableHead>
              <TableHead
                className="text-gray-300 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("status")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "120px",
                }}
              >
                <div className="flex items-center gap-2">
                  Estado
                  {renderSortIcon("status")}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 whitespace-nowrap"
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "100px",
                }}
              >
                Canal
              </TableHead>
              <TableHead
                className="text-gray-300 whitespace-nowrap cursor-pointer"
                onClick={() => handleSort("createdAt")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "120px",
                }}
              >
                <div className="flex items-center gap-2">
                  Creado
                  {renderSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 whitespace-nowrap"
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "120px",
                }}
              >
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Mostrar skeletons mientras carga
              Array.from({ length: 10 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : contacts.length === 0 ? (
              // Estado vacío
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="text-gray-400">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No hay contactos</p>
                    <p className="text-sm">Los contactos aparecerán aquí cuando se agreguen</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Mostrar contactos reales
              contacts.map((contact) => {
                const ChannelIcon = channelIcons[contact.channel];
                const isSelected = selectedContactId === contact.id;
                // const isExpanded = expandedRow === contact.id; // TODO: Implementar cuando se necesite

                return (
                  <TableRow
                    key={contact.id}
                    className={cn(
                      "border-gray-800 cursor-pointer transition-colors",
                      isSelected
                        ? "bg-blue-900/30 border-blue-700"
                        : "hover:bg-gray-800/50",
                    )}
                    onClick={() => handleRowClick(contact.id)}
                  >
                    {/* Owner */}
                    <TableCell
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#E4E4E7",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {contact.owner?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="truncate">{contact.owner || 'Sin asignar'}</span>
                      </div>
                    </TableCell>

                    {/* Contact Info */}
                    <TableCell
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#E4E4E7",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={`${contact.firstName} ${contact.lastName}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {contact.firstName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">
                            {`${contact.firstName} ${contact.lastName}`}
                          </p>
                          {contact.company && (
                            <p className="text-xs text-gray-400 truncate">
                              {contact.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#A1A1AA",
                      }}
                    >
                      <span className="truncate">{contact.email}</span>
                    </TableCell>

                    {/* Phone */}
                    <TableCell
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#A1A1AA",
                      }}
                    >
                      <span className="truncate">{contact.phone}</span>
                    </TableCell>

                    {/* Status */}
                    <TableCell
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                      }}
                    >
                      <Badge className={cn("text-xs", statusColors[contact.status])}>
                        {statusLabels[contact.status]}
                      </Badge>
                    </TableCell>

                    {/* Channel */}
                    <TableCell
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <ChannelIcon
                          className={cn("w-4 h-4", channelColors[contact.channel])}
                        />
                        <span className={cn("text-sm", channelColors[contact.channel])}>
                          {channelNames[contact.channel]}
                        </span>
                      </div>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                        color: "#A1A1AA",
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">
                          {formatDate(contact.createdAt)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContact(contact.id);
                          }}
                          variant="default"
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>

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
