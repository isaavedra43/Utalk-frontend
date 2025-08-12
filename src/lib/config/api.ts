// src/lib/config/api.ts
import { browser } from '$app/environment';

// Variables de entorno - usar window para acceso en cliente
const STATIC_PUBLIC_API_BASE: string | undefined = typeof window !== 'undefined' ? ((window as unknown) as Record<string, unknown>).PUBLIC_API_BASE as string : undefined;
const STATIC_API_URL: string | undefined = typeof window !== 'undefined' ? ((window as unknown) as Record<string, unknown>).API_URL as string : undefined;

/**
 * Base de API:
 * - En navegador: PUBLIC_API_BASE (obligatorio)
 * - En server (SSR): PUBLIC_API_BASE si existe, si no API_URL
 */
const RAW_BASE = browser
  ? (STATIC_PUBLIC_API_BASE || '')
  : (STATIC_PUBLIC_API_BASE || STATIC_API_URL || '');

export const API_BASE = (RAW_BASE || '').replace(/\/+$/, ''); // sin slash final

/** Limpia paths: quita "/" inicial y "api/" si viniera incluido por error */
export function cleanPath(path: string): string {
  let p = String(path || '').trim();
  p = p.replace(/^\/+/, '');      // quita "/" iniciales
  p = p.replace(/^api\/+/i, '');  // quita "api/" duplicado
  return p;
}

/** Construye URL absoluta hacia el backend de Railway */
export function apiUrl(path: string): string {
  const p = cleanPath(path);
  if (!API_BASE) {
    // Fallback de seguridad (no debería ocurrir en PROD): usa /api del front
    return `/api/${p}`;
  }
  return `${API_BASE}/${p}`;
}

/** Convierte http(s) base a ws(s) para Socket.IO (si se necesitara) */
export function wsBase(): string {
  if (!API_BASE) return '';
  return API_BASE.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
}
