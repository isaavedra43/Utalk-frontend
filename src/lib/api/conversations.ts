/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiUrl } from '$lib/config/api';
import { toDateSafe } from '$lib/utils/time';
import { httpGet } from './http';

export type Conversation = {
  id: string;
  lastMessageAt?: string | Date | null;
  updatedAt?: string | Date | null;
  [k: string]: any;
};

type ListParams = {
  page?: number;
  limit?: number;
  status?: 'open' | 'pending' | 'resolved' | 'closed' | 'all';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  search?: string;
};

export async function fetchConversations(params: ListParams = {}): Promise<{ items: Conversation[]; total?: number }> {
  const url = new URL(apiUrl('conversations'));

  // ===> PARAMS EXACTOS QUE ESPERA EL BACKEND:
  if (params.page) url.searchParams.set('page', String(params.page));
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') url.searchParams.set('status', params.status);
  if (params.priority) url.searchParams.set('priority', params.priority);
  if (params.assignedTo) url.searchParams.set('assignedTo', params.assignedTo);
  if (params.search) url.searchParams.set('search', params.search);

  // eslint-disable-next-line no-console
  console.info('CONV DEBUG', { url: url.toString() });

  const res = await httpGet<any>(url.toString());
  
  // Parser tolerante al shape real del backend (según ResponseHandler.success)
  const rows = res?.data ?? res ?? [];
  
  // eslint-disable-next-line no-console
  console.info('CONV DEBUG', { 
    count: Array.isArray(rows) ? rows.length : 0, 
    sample: Array.isArray(rows) ? rows[0] : null,
    responseShape: Object.keys(res || {})
  });

  const items: Conversation[] = (Array.isArray(rows) ? rows : []).map((c: any) => ({
    ...c,
    lastMessageAt: toDateSafe(c?.lastMessageAt ?? c?.lastMessage?.timestamp ?? c?.updatedAt ?? null),
    updatedAt: toDateSafe(c?.updatedAt ?? c?.lastMessageAt ?? null),
  }));

  // El backend no devuelve pagination en este endpoint, solo el array directo
  return { items, total: items.length };
} 