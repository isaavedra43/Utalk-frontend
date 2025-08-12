import { httpGetArray } from '$lib/api/http';
import { toDateSafe } from '$lib/utils/time';

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
  // 🔴 Antes: httpGetArray('/api/conversations')  → duplicaba /api
  const data = await httpGetArray<any>('conversations');

  // Normaliza fechas si vienen como timestamp Firestore
  const normalizeTs = (ts: any) => toDateSafe(ts)?.toISOString() ?? null;

  const conversations: Conversation[] = (Array.isArray(data) ? data : (data as any)?.data || (data as any)?.conversations || []).map(
    (c: any) => ({
      id: c.id,
      customerPhone: c.customerPhone ?? c.contact?.phone ?? '',
      participants: c.participants ?? [],
      lastMessage: c.lastMessage ?? null,
      lastMessageAt: normalizeTs(c.lastMessageAt ?? c.lastMessage?.timestamp),
      updatedAt: normalizeTs(c.updatedAt ?? c.lastMessageAt),
      unreadCount: Number(c.unreadCount ?? 0),
      status: c.status ?? 'open',
      workspaceId: c.workspaceId ?? c.workspace ?? 'default_workspace',
      tenantId: c.tenantId ?? c.tenant ?? 'default_tenant'
    })
  );

  const total = Number(((data as any)?.pagination?.total ?? conversations.length) || conversations.length);
  return { conversations, pagination: (data as any)?.pagination ?? null, conversationCount: total };
} 