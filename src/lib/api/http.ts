// Utalk-frontend/src/lib/api/http.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiUrl, cleanPath } from '$lib/config/api';

type Json = Record<string, any> | any[] | null;

function isHtml(s: string | undefined) {
  if (!s) return false;
  const t = s.trim().toLowerCase();
  return t.startsWith('<!doctype') || t.startsWith('<html');
}

async function doFetch<T = any>(method: string, path: string, body?: Json, init?: RequestInit): Promise<T> {
  const url = apiUrl(path); // SIEMPRE Railway
  const res = await fetch(url, {
    method,
    credentials: 'include',              // <— cookies cross-site
    headers: {
      'Accept': 'application/json',
      ...(body !== null ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {})
    },
    body: body !== null ? JSON.stringify(body) : undefined,
    ...init
  });

  const raw = await res.text();          // evita conflictos de encoding
  if (!res.ok || isHtml(raw)) {
    throw new Error(`HTTP ${res.status} - ${raw?.slice(0, 400)}`);
  }
  return raw ? JSON.parse(raw) as T : (null as T);
}

// Helpers públicos
export const httpGet    = <T = any>(path: string, init?: RequestInit) => doFetch<T>('GET',    cleanPath(path), undefined, init);
export const httpPost   = <T = any>(path: string, body?: Json, init?: RequestInit) => doFetch<T>('POST',   cleanPath(path), body, init);
export const httpPut    = <T = any>(path: string, body?: Json, init?: RequestInit) => doFetch<T>('PUT',    cleanPath(path), body, init);
export const httpPatch  = <T = any>(path: string, body?: Json, init?: RequestInit) => doFetch<T>('PATCH',  cleanPath(path), body, init);
export const httpDelete = <T = any>(path: string, body?: Json, init?: RequestInit) => doFetch<T>('DELETE', cleanPath(path), body, init); 