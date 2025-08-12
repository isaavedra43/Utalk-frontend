/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // Construir query string manualmente
  const searchParams = new URLSearchParams();
  
  // ===> PARAMS EXACTOS QUE ESPERA EL BACKEND:
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.priority) searchParams.set('priority', params.priority);
  if (params.assignedTo) searchParams.set('assignedTo', params.assignedTo);
  if (params.search) searchParams.set('search', params.search);

  // Construir path relativo con query string
  const path = 'conversations' + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  // eslint-disable-next-line no-console
  console.info('CONV DEBUG', { path, url: `https://utalk-backend-production.up.railway.app/api/${path}` });

  const res = await httpGet<any>(path);
  
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