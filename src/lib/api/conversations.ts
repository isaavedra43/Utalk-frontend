/* eslint-disable @typescript-eslint/no-explicit-any */
import { toDateSafe } from '$lib/utils/time';
import { httpGet } from './http';

export type Conversation = {
  id: string;
  lastMessageAt?: string | Date | null;
  updatedAt?: string | Date | null;
  [k: string]: any;
};

export async function fetchConversations(): Promise<{ items: Conversation[]; total?: number }> {
  const res = await httpGet<any>('conversations'); // SIN /api
  // Tolerante a shapes del back:
  const list = res?.data?.conversations ?? res?.conversations ?? res?.data ?? res ?? [];
  const items: Conversation[] = (Array.isArray(list) ? list : []).map((c: any) => ({
    ...c,
    lastMessageAt: toDateSafe(c?.lastMessageAt ?? c?.lastMessage?.timestamp ?? c?.updatedAt ?? null),
    updatedAt: toDateSafe(c?.updatedAt ?? c?.lastMessageAt ?? null),
  }));
  const total = Number(res?.data?.pagination?.total ?? res?.pagination?.total ?? res?.total ?? 0);
  return { items, total: Number.isFinite(total) ? total : undefined };
} 