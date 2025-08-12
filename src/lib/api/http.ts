// Cliente HTTP con base absoluta si existe PUBLIC_API_BASE (cliente),
// o relative '/api' si usamos proxy de SvelteKit.
// SvelteKit: PUBLIC_* es accesible en cliente.
// API_URL (privada) la usaremos solo en el proxy server-side.

// Variables de entorno - usar window para acceso en cliente
const STATIC_PUBLIC_API_BASE: string | undefined = typeof window !== 'undefined' ? ((window as unknown) as Record<string, unknown>).PUBLIC_API_BASE as string : undefined;
const DYN_PUBLIC: Record<string, string> = typeof window !== 'undefined' ? ((window as unknown) as Record<string, unknown>).env as Record<string, string> : {};

export type HttpGetOptions = {
  credentials?: 'include' | 'omit' | 'same-origin';
  headers?: Record<string, string>;
};

function joinUrl(base: string, path: string): string {
  const b = (base || '').replace(/\/+$/, '');
  const p = (path || '').replace(/^\/+/, '');
  return b ? `${b}/${p}` : `/${p}`;
}

// Si hay PUBLIC_API_BASE en el navegador, usaremos llamada directa al backend.
// Si NO hay (caso típico de tu setup actual que usa API_URL privada), usaremos el proxy '/api'.
const PUBLIC_API_BASE =
  DYN_PUBLIC?.PUBLIC_API_BASE ||
  STATIC_PUBLIC_API_BASE ||
  ''; // vacío => usar proxy '/api'

function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (PUBLIC_API_BASE) return joinUrl(PUBLIC_API_BASE, path);
  // Fallback: proxy local del front (ver /src/routes/api/[...path]/+server.ts)
  return joinUrl('', path.startsWith('api/') ? path : `api/${path.replace(/^\/+/, '')}`);
}

function unwrapArrayShape(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  const bodyObj = body as Record<string, unknown>;
  if (Array.isArray(bodyObj?.data)) return bodyObj.data as unknown[];
  if (Array.isArray(bodyObj?.items)) return bodyObj.items as unknown[];
  if (Array.isArray(bodyObj?.conversations)) return bodyObj.conversations as unknown[];
  if (bodyObj?.data && typeof bodyObj.data === 'object' && bodyObj.data !== null) {
    const dataObj = bodyObj.data as Record<string, unknown>;
    if (Array.isArray(dataObj?.conversations)) return dataObj.conversations as unknown[];
  }
  return [];
}

export async function httpGetArray<T = unknown>(
  path: string,
  opts: HttpGetOptions = {}
): Promise<{ list: T[]; raw: unknown; total?: number }> {
  const url = apiUrl(path);
  const res = await fetch(url, {
    method: 'GET',
    credentials: opts.credentials ?? 'include', // importante para cookies
    headers: { ...(opts.headers || {}) },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const hint = text?.trim().startsWith('<!doctype') ? ' (recibido HTML: ¿estabas llamando al dominio del frontend sin proxy?)' : '';
    throw new Error(`HTTP ${res.status} ${res.statusText}${hint}`);
  }

  const totalHeader = res.headers.get('X-Total-Count');
  const total = totalHeader ? Number(totalHeader) : undefined;

  let body: unknown = {};
  try { body = await res.json(); } catch { body = {}; }

  return { list: unwrapArrayShape(body) as T[], raw: body, total };
} 