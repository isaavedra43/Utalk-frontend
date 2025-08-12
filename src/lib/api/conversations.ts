import { toDateSafe } from '../utils/time';
import { httpGetArray } from './http';

export type Message = {
  id: string;
  conversationId?: string;
  sender?: string;
  direction?: 'inbound' | 'outbound';
  messageId?: string;
  content?: string;
  timestamp?: string | number | Date | { _seconds?: number; _nanoseconds?: number; seconds?: number; nanoseconds?: number } | null | undefined;
};

export type Conversation = {
  id: string;
  customerPhone?: string;
  participants?: string[];
  status?: string;
  tenantId?: string;
  workspaceId?: string;
  unreadCount?: number;
  lastMessage?: Message | null;
  lastMessageAt?: string | number | Date | { _seconds?: number; _nanoseconds?: number; seconds?: number; nanoseconds?: number } | null | undefined;
  updatedAt?: string | number | Date | { _seconds?: number; _nanoseconds?: number; seconds?: number; nanoseconds?: number } | null | undefined;
};

export type ConversationUI = {
  id: string;
  title: string;
  phone?: string;
  participants: string[];
  unread: number;
  status: string;
  lastText?: string;
  lastAt?: Date | null;
  updatedAt?: Date | null;
};

const normalizeId = (v: string | number | null | undefined): string => String(v ?? '').trim();

export async function fetchConversations() {
  const { list, raw, total } = await httpGetArray<Conversation>('/api/conversations');

  const items: ConversationUI[] = (list || []).map((c) => {
    const id = normalizeId(c.id);
    const last = c.lastMessage ?? null;

    const lastAt =
      toDateSafe(last?.timestamp) ??
      toDateSafe(c.lastMessageAt) ??
      toDateSafe(c.updatedAt);

    return {
      id,
      title: c.customerPhone ?? id,
      phone: c.customerPhone,
      participants: Array.isArray(c.participants) ? c.participants : [],
      unread: Number(c.unreadCount ?? 0),
      status: String(c.status ?? 'open'),
      lastText: last?.content ?? undefined,
      lastAt,
      updatedAt: toDateSafe(c.updatedAt) ?? lastAt,
    };
  });

  return { items, raw, total };
} 