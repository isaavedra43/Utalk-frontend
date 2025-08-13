// Utalk-frontend/src/lib/config/api.ts
// Variables de entorno - usar window para acceso en cliente
const STATIC_PUBLIC_API_BASE: string | undefined =
  typeof window !== 'undefined'
    ? ((window as unknown as Record<string, unknown>).PUBLIC_API_BASE as string)
    : undefined;

/** Base absoluta a Railway, sin trailing slash */
export const API_BASE = (
  STATIC_PUBLIC_API_BASE || 'https://utalk-backend-production.up.railway.app/api'
).replace(/\/+$/, '');

/** Quita "/" inicial y "api/" duplicado del path de negocio */
export function cleanPath(path: string): string {
  let p = String(path || '').trim();
  // Si ya es una URL absoluta, NO tocar
  if (/^https?:\/\//i.test(p)) return p;
  p = p.replace(/^\/+/, ''); // quita "/" inicial
  p = p.replace(/^api\/+/i, ''); // evita doble "api/"
  return p;
}

/** Construye URL absoluta hacia el backend (Railway) */
export function apiUrl(path: string): string {
  // Si el caller manda una URL absoluta, respétala tal cual (short-circuit)
  if (/^https?:\/\//i.test(String(path))) return String(path);

  const p = cleanPath(path);
  return `${API_BASE}/${p}`;
}

/** WS base para Socket.IO o WS nativo */
export function wsUrl(path: string): string {
  const u = new URL(API_BASE);
  const proto = u.protocol === 'https:' ? 'wss:' : 'ws:';
  const p = cleanPath(path);
  return `${proto}//${u.host}/${p}`;
}
