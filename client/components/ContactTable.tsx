import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact } from "./CustomerHub";

interface ContactTableProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onEditContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onSendCampaign: (contactId: string) => void;
  isLoading: boolean;
}

type SortField = "owner" | "name" | "email" | "status" | "timestamp";
type SortDirection = "asc" | "desc";

const statusColors = {
  "new-lead": "bg-green-500/20 text-green-400 border-green-500/30",
  "hot-lead": "bg-red-500/20 text-red-400 border-red-500/30",
  payment: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  customer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const statusLabels = {
  "new-lead": "New Lead",
  "hot-lead": "Hot Lead",
  payment: "Payment",
  customer: "Customer",
};

const channelIcons = {
  whatsapp: MessageCircle,
  facebook: MessageCircle,
  instagram: MessageCircle,
  telegram: MessageCircle,
  email: Mail,
  sms: Phone,
};

const channelColors = {
  whatsapp: "text-green-400",
  facebook: "text-blue-400",
  instagram: "text-pink-400",
  telegram: "text-blue-500",
  email: "text-blue-400",
  sms: "text-purple-400",
};

const getSentimentEmoji = (sentiment?: string) => {
  switch (sentiment) {
    case "positive":
      return "😊";
    case "negative":
      return "😞";
    case "neutral":
    default:
      return "😐";
  }
};

// AI Tags mock data
const aiTags: Record<string, string> = {
  "1": "High Priority",
  "2": "VIP Cliente",
  "3": "Quick Convert",
  "4": "Loyal Customer",
};

const getIATagStyle = (tag: string) => {
  const styles: Record<string, string> = {
    "High Priority": "bg-red-600 text-white",
    "VIP Cliente": "bg-purple-600 text-white",
    "Quick Convert": "bg-green-600 text-white",
    "Loyal Customer": "bg-blue-600 text-white",
    default: "bg-gray-600 text-white",
  };
  return styles[tag] || styles.default;
};

export function ContactTable({
  contacts,
  selectedContactId,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onSendCampaign,
  isLoading,
}: ContactTableProps) {
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedContacts = () => {
    return [...contacts].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "owner":
          aValue = a.owner.toLowerCase();
          bValue = b.owner.toLowerCase();
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "email":
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "timestamp":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const getPaginatedContacts = () => {
    const sortedContacts = getSortedContacts();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedContacts.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(contacts.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, contacts.length);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-400" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-400" />
    );
  };

  const paginatedContacts = getPaginatedContacts();

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-center text-gray-400 p-8">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No contacts found</h3>
          <p className="text-sm mb-4">No contacts match your current filters</p>
          <Button
            onClick={() => console.log("Clear filters")}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-950 flex flex-col h-full">
      {/* Table Container with Fixed Height and Scroll */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          maxHeight: "calc(100vh - 200px)",
          minHeight: 0,
        }}
      >
        {/* Horizontal scroll wrapper */}
        <div
          className="overflow-x-auto w-full"
          style={{
            overflowX: "auto",
            width: "100%",
          }}
        >
          <Table className="w-full min-w-max">
            <TableHeader
              className="sticky top-0 z-10"
              style={{
                position: "sticky",
                top: 0,
                background: "#1E1F23",
                zIndex: 10,
              }}
            >
              <TableRow className="border-gray-800 hover:bg-gray-900/50">
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "140px",
                  }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("owner")}
                    className="h-8 px-2 text-gray-300 hover:text-white text-sm"
                  >
                    Owner
                    <SortIcon field="owner" />
                  </Button>
                </TableHead>
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "180px",
                  }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-8 px-2 text-gray-300 hover:text-white text-sm"
                  >
                    Name
                    <SortIcon field="name" />
                  </Button>
                </TableHead>
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "200px",
                  }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("email")}
                    className="h-8 px-2 text-gray-300 hover:text-white text-sm"
                  >
                    Email
                    <SortIcon field="email" />
                  </Button>
                </TableHead>
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "140px",
                  }}
                >
                  Phone
                </TableHead>
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "120px",
                  }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="h-8 px-2 text-gray-300 hover:text-white text-sm"
                  >
                    Status
                    <SortIcon field="status" />
                  </Button>
                </TableHead>
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "300px",
                  }}
                >
                  Last Message
                </TableHead>
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "120px",
                  }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("timestamp")}
                    className="h-8 px-2 text-gray-300 hover:text-white text-sm"
                  >
                    Date/Time
                    <SortIcon field="timestamp" />
                  </Button>
                </TableHead>
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "120px",
                  }}
                >
                  IA Tag
                </TableHead>
                <TableHead
                  className="text-gray-300 whitespace-nowrap"
                  style={{
                    padding: "12px 16px",
                    fontSize: "14px",
                    minWidth: "120px",
                  }}
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContacts.map((contact) => {
                const ChannelIcon = channelIcons[contact.channel];
                const isSelected = selectedContactId === contact.id;
                const iaTag = aiTags[contact.id] || "Standard";

                return (
                  <TableRow
                    key={contact.id}
                    className={cn(
                      "border-gray-800 hover:bg-gray-900/50 cursor-pointer",
                      isSelected && "bg-gray-800/50",
                    )}
                    onClick={() => onSelectContact(contact.id)}
                  >
                    <TableCell
                      className="text-gray-300 whitespace-nowrap"
                      style={{ padding: "12px 16px", fontSize: "13px" }}
                    >
                      {contact.owner}
                    </TableCell>
                    <TableCell
                      className="whitespace-nowrap"
                      style={{ padding: "12px 16px", fontSize: "13px" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {contact.avatarUrl ? (
                            <img
                              src={contact.avatarUrl}
                              alt={contact.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-950 rounded-full flex items-center justify-center border border-gray-700">
                            <ChannelIcon
                              className={cn(
                                "w-2.5 h-2.5",
                                channelColors[contact.channel],
                              )}
                            />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {contact.channel}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-gray-300"
                      style={{ padding: "12px 16px", fontSize: "13px" }}
                    >
                      <div className="truncate max-w-[180px]">
                        <p className="truncate">{contact.email}</p>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-gray-300"
                      style={{ padding: "12px 16px", fontSize: "13px" }}
                    >
                      <div>
                        <p className="text-sm">{contact.phone}</p>
                        <p className="text-xs text-gray-400">WhatsApp</p>
                      </div>
                    </TableCell>
                    <TableCell
                      style={{ padding: "12px 16px", fontSize: "14px" }}
                    >
                      <Badge
                        className={cn("border", statusColors[contact.status])}
                      >
                        {statusLabels[contact.status]}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell"
                      style={{ padding: "12px 16px", fontSize: "14px" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm truncate max-w-[250px]">
                          {contact.lastMessage}
                        </span>
                        <span className="text-sm">
                          {getSentimentEmoji(contact.sentiment)}
                        </span>
                        {contact.isUnread && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell"
                      style={{ padding: "12px 16px", fontSize: "14px" }}
                    >
                      <div className="text-gray-400 text-sm">
                        <p>{contact.timestamp}</p>
                        {contact.aiScore && (
                          <p className="text-xs text-blue-400">
                            AI: {contact.aiScore}%
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      style={{ padding: "12px 16px", fontSize: "14px" }}
                    >
                      <Badge
                        className={cn("text-xs", getIATagStyle(iaTag))}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        {iaTag}
                      </Badge>
                    </TableCell>
                    <TableCell
                      style={{ padding: "12px 16px", fontSize: "14px" }}
                    >
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditContact(contact.id);
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          title="Edit contact"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendCampaign(contact.id);
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400"
                          title="Send campaign"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContact(contact.id);
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                          title="Delete contact"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-400">Processing...</span>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="border-t border-gray-800 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {startItem}–{endItem} of {contacts.length} contacts
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm text-gray-400 px-4">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
