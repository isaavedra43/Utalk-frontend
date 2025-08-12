// Utalk-frontend/src/lib/api/http.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiUrl } from '$lib/config/api';
import { getAccessToken, setAccessToken } from '$lib/stores/auth.store';

async function rawFetch(method: string, path: string, body?: any, init?: RequestInit) {
  const url = apiUrl(path);
  const token = getAccessToken();
  
  // Debug logging solo en desarrollo
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // eslint-disable-next-line no-console
    console.debug('[HTTP]', method, url, { hasToken: !!token });
  }
  
  // Guard DEV: confirmar URL final correcta
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[HTTP]', method, url);
  }
  
  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(init?.headers || {})
    },
    body: body ? JSON.stringify(body) : undefined,
    ...init
  });
  return res;
}

async function fetchJson(method: string, path: string, body?: any, init?: RequestInit, _retry = false) {
  const res = await rawFetch(method, path, body, init);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (res.ok) return data;

  // intento de refresh sólo una vez ante 401
  if (res.status === 401 && !_retry) {
    try {
      const r = await rawFetch('POST', 'auth/refresh');
      const t = await r.json().catch(() => null);
      if (r.ok && t?.accessToken) {
        setAccessToken(t.accessToken);
        return fetchJson(method, path, body, init, true);
      }
          } catch {
        // Ignorar errores de refresh
      }
  }
  // si llega aquí, error definitivo
  if (data?.message) throw new Error(`HTTP ${res.status} - ${data.message}`);
  throw new Error(`HTTP ${res.status} - ${text?.slice(0, 300)}`);
}

export const httpGet = <T = any>(p: string) => fetchJson('GET', p) as Promise<T>;
export const httpPost = <T = any>(p: string, b?: any) => fetchJson('POST', p, b) as Promise<T>;
export const httpPut = <T = any>(p: string, b?: any) => fetchJson('PUT', p, b) as Promise<T>;
export const httpPatch = <T = any>(p: string, b?: any) => fetchJson('PATCH', p, b) as Promise<T>;
export const httpDelete = <T = any>(p: string) => fetchJson('DELETE', p) as Promise<T>; 