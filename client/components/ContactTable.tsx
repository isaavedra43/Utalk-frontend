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

  const sortedContacts = getSortedContacts();

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
    <div className="flex-1 bg-gray-950 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="px-0 py-4">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-900/50">
                <TableHead className="w-[140px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("owner")}
                    className="h-8 px-2 text-gray-300 hover:text-white"
                  >
                    Owner
                    <SortIcon field="owner" />
                  </Button>
                </TableHead>
                <TableHead className="w-[180px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-8 px-2 text-gray-300 hover:text-white"
                  >
                    Name
                    <SortIcon field="name" />
                  </Button>
                </TableHead>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("email")}
                    className="h-8 px-2 text-gray-300 hover:text-white"
                  >
                    Email
                    <SortIcon field="email" />
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">Phone</TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="h-8 px-2 text-gray-300 hover:text-white"
                  >
                    Status
                    <SortIcon field="status" />
                  </Button>
                </TableHead>
                <TableHead className="w-[300px]">Last Message</TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("timestamp")}
                    className="h-8 px-2 text-gray-300 hover:text-white"
                  >
                    Date/Time
                    <SortIcon field="timestamp" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContacts.map((contact) => {
                const ChannelIcon = channelIcons[contact.channel];
                const isSelected = selectedContactId === contact.id;
                const isExpanded = expandedRow === contact.id;

                return (
                  <TableRow
                    key={contact.id}
                    className={cn(
                      "border-gray-800 hover:bg-gray-900/50 cursor-pointer",
                      isSelected && "bg-gray-800/50",
                    )}
                    onClick={() => onSelectContact(contact.id)}
                  >
                    <TableCell className="text-gray-300">
                      {contact.owner}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
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
                        <div>
                          <p className="text-white font-medium">
                            {contact.name}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {contact.channel}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {contact.email}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {contact.phone}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn("border", statusColors[contact.status])}
                      >
                        {statusLabels[contact.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      <div className="text-gray-400 text-sm">
                        <p>{contact.timestamp}</p>
                        {contact.aiScore && (
                          <p className="text-xs text-blue-400">
                            AI: {contact.aiScore}%
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
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

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-400">Processing...</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
