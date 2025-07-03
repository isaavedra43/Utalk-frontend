import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Edit,
  Send,
  Trash2,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact } from "./CustomerHub";

interface ContactCardsProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contactId: string) => void;
  onEditContact: (contactId: string) => void;
  onDeleteContact: (contactId: string) => void;
  onSendCampaign: (contactId: string) => void;
  isLoading: boolean;
}

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

const channelNames = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  telegram: "Telegram",
  email: "Email",
  sms: "SMS",
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

export function ContactCards({
  contacts,
  selectedContactId,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onSendCampaign,
  isLoading,
}: ContactCardsProps) {
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
        <div className="p-4">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
                        Inbox &gt; {contact.section}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#CCC] text-sm">
                        {contact.timestamp}
                      </span>
                      {contact.isUnread && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Avatar + Name + Channel */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      {contact.avatarUrl ? (
                        <img
                          src={contact.avatarUrl}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-white text-lg font-medium">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#252535] rounded-full flex items-center justify-center border border-gray-700">
                        <ChannelIcon
                          className={cn(
                            "w-3 h-3",
                            channelColors[contact.channel],
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-base font-medium truncate">
                        {contact.name}
                      </h3>
                      <p
                        className={cn(
                          "text-sm font-medium",
                          channelColors[contact.channel],
                        )}
                      >
                        {channelNames[contact.channel]}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {contact.email}
                      </p>
                    </div>
                  </div>

                  {/* Last Message */}
                  <div className="mb-3">
                    <div className="flex items-start gap-2">
                      <p
                        className="text-[#DDD] text-sm line-clamp-2 flex-1"
                        title={contact.lastMessage}
                      >
                        {contact.lastMessage}
                      </p>
                      <span className="text-lg flex-shrink-0">
                        {getSentimentEmoji(contact.sentiment)}
                      </span>
                    </div>
                  </div>

                  {/* Status Tags */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "border text-xs",
                          statusColors[contact.status],
                        )}
                      >
                        {statusLabels[contact.status]}
                      </Badge>
                      {contact.aiScore && (
                        <Badge className="bg-gray-700 text-gray-300 text-xs">
                          AI: {contact.aiScore}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 mb-4 text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="h-3 w-3" />
                      <span>{contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>Owner: {contact.owner}</span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
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

                    {/* Owner initials */}
                    <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {contact.owner
                          .split(" ")
                          .map((n) => n.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-400">Processing...</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
