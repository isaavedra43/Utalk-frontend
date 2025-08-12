// src/lib/api/http.ts
import { apiUrl, cleanPath } from '$lib/config/api';

type Json = Record<string, unknown> | Array<unknown>;

function isHtml(s: string) {
  const t = s.trim().toLowerCase();
  return t.startsWith('<!doctype') || t.startsWith('<html');
}

async function doFetch(method: string, path: string, body?: Json, init?: RequestInit) {
  const url = apiUrl(path);
  const res = await fetch(url, {
    method,
    credentials: 'include',               // cookies cross-site (refresh token)
    headers: {
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {})
    },
    body: body ? JSON.stringify(body) : undefined,
    ...init
  });

  const raw = await res.text();
  if (!res.ok || isHtml(raw)) {
    throw new Error(`HTTP ${res.status} - ${raw?.slice(0, 300)}`);
  }
  return raw ? JSON.parse(raw) : null;
}

export const httpGet = <T = unknown>(path: string) => doFetch('GET', cleanPath(path)) as Promise<T>;
export const httpPost = <T = unknown>(path: string, body?: Json) => doFetch('POST', cleanPath(path), body) as Promise<T>;
export const httpPut =  <T = unknown>(path: string, body?: Json) => doFetch('PUT',  cleanPath(path), body) as Promise<T>;
export const httpPatch=<T = unknown>(path: string, body?: Json) => doFetch('PATCH',cleanPath(path), body) as Promise<T>;
export const httpDel =  <T = unknown>(path: string)              => doFetch('DELETE',cleanPath(path)) as Promise<T>; 