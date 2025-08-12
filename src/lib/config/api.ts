// src/lib/config/api.ts
// Variables de entorno - usar window para acceso en cliente
const STATIC_PUBLIC_API_BASE: string | undefined = typeof window !== 'undefined' ? ((window as unknown) as Record<string, unknown>).PUBLIC_API_BASE as string : undefined;

const BASE = (STATIC_PUBLIC_API_BASE || 'https://utalk-backend-production.up.railway.app/api').replace(/\/+$/, '');

export function cleanPath(path: string): string {
  let p = String(path || '').trim();
  p = p.replace(/^\/+/, '');      // quita "/" iniciales
  p = p.replace(/^api\/+/i, '');  // evita doble "api/"
  return p;
}

export function apiUrl(path: string): string {
  return `${BASE}/${cleanPath(path)}`;
}

export function wsUrl(path: string): string {
  const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
  const p = cleanPath(path);
  return `${proto}://${new URL(BASE).host}/${p}`;
}
