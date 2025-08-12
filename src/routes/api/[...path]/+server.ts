// Proxy server-side para /api/*
// Toma API_URL (privada, sin PUBLIC_) y reenvía la request al backend.
// Soporta GET/POST/PUT/PATCH/DELETE/OPTIONS, pasando cookies/headers y retornando Set-Cookie.

import type { RequestEvent } from '@sveltejs/kit';

// API_URL privada del servidor
const API_BASE_RAW = process.env.API_URL || ''; // ej: https://utalk-backend-production.up.railway.app/api
const API_BASE = API_BASE_RAW.replace(/\/+$/, '');

function buildTargetUrl(event: RequestEvent): string {
  // params.path = 'conversations' si el usuario consulta /api/conversations?...
  const tail = (event.params as Record<string, string>)?.path || '';
  const search = event.url.search || '';
  // Si API_URL ya termina en /api, no necesitamos re-agregar 'api'
  return `${API_BASE}/${tail}${search}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function copyHeaders(src: any, omit: string[] = []): any {
  const out = new (globalThis as any).Headers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  src.forEach((v: any, k: any) => {
    if (!omit.includes(k.toLowerCase())) out.set(k, v);
  });
  return out;
}

async function proxy(event: RequestEvent): Promise<Response> {
  if (!API_BASE) {
    return new Response(JSON.stringify({ error: 'API_URL no configurada en el frontend (entorno server).' }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  // Preflight simple
  if (event.request.method === 'OPTIONS') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h = new (globalThis as any).Headers();
    h.set('access-control-allow-origin', event.request.headers.get('origin') || '*');
    h.set('access-control-allow-credentials', 'true');
    h.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    h.set('access-control-allow-headers', event.request.headers.get('access-control-request-headers') || 'content-type,authorization');
    return new Response(null, { status: 204, headers: h });
  }

  const target = buildTargetUrl(event);
  const omitReq = ['host', 'content-length', 'connection'];
  const headers = copyHeaders(event.request.headers, omitReq);

  // Clonar body si aplica
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = undefined;
  const method = event.request.method.toUpperCase();
  if (!['GET', 'HEAD'].includes(method)) {
    const buf = await event.request.arrayBuffer();
    body = buf.byteLength ? buf : undefined;
  }

  // Usar fetch interno de SvelteKit para mantener adapter.
  const res = await event.fetch(target, {
    method,
    headers,
    body,
    redirect: 'manual',
  });

  // Copiar headers de respuesta tal cual (incluye Set-Cookie)
  const outHeaders = copyHeaders(res.headers);

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: outHeaders
  });
}

// Exportar handlers para todos los métodos
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy; 