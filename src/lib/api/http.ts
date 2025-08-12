// src/lib/api/http.ts
import { apiUrl, cleanPath } from '$lib/config/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function joinHeaders(init?: Record<string, string>): Record<string, string> {
  const h = new (globalThis as any).Headers(init || {});
  if (!h.has('Content-Type')) h.set('Content-Type', 'application/json; charset=utf-8');
  return Object.fromEntries(h.entries());
}

async function http<T = unknown>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  init?: RequestInit
): Promise<T> {
  const url = apiUrl(path);
  const headers = joinHeaders(init?.headers as Record<string, string>);

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body !== null ? JSON.stringify(body) : undefined,
    ...init
  });

  const text = await res.text();

  // Si vino HTML, es error de enrutamiento
  const looksHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
  if (!res.ok || looksHtml) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = JSON.parse(text);
      msg = data?.message || data?.error || msg;
      throw new Error(msg);
    } catch {
      throw new Error(looksHtml ? `RUTA INVÁLIDA (HTML recibido) - ${msg}` : msg);
    }
  }

  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const httpGet = <T = unknown>(path: string, init?: RequestInit) =>
  http<T>('GET', cleanPath(path), undefined, init);

export const httpGetArray = <T = unknown>(path: string, init?: RequestInit) =>
  http<T[]>('GET', cleanPath(path), undefined, init);

export const httpPost = <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
  http<T>('POST', cleanPath(path), body, init);

export const httpPut = <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
  http<T>('PUT', cleanPath(path), body, init);

export const httpPatch = <T = unknown>(path: string, body?: unknown, init?: RequestInit) =>
  http<T>('PATCH', cleanPath(path), body, init);

export const httpDelete = <T = unknown>(path: string, init?: RequestInit) =>
  http<T>('DELETE', cleanPath(path), undefined, init); 