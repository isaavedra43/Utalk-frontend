import { httpGet } from '$lib/api/http';

export type Conversation = {
  id: string;
  customerPhone: string;
  participants?: string[];
  lastMessage?: any;
  lastMessageAt?: any;
  updatedAt?: any;
  unreadCount?: number;
  status?: string;
  workspaceId?: string;
  tenantId?: string;
};

export async function fetchConversations() {
  return httpGet('conversations'); // <-- no '/api/'
} 