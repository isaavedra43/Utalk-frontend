// src/routes/api/[...path]/+server.ts
import type { RequestHandler } from './$types';
const BACKEND = 'https://utalk-backend-production.up.railway.app/api';

const HOP_BY_HOP = new Set([
  'connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade'
]);
const ENCODING = new Set(['content-encoding','content-length']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterHeaders(src: any, drop: Set<string>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out = new (globalThis as any).Headers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  src.forEach((v: any, k: any) => { if (!drop.has(k.toLowerCase())) out.set(k, v); });
  return out;
}

async function forward(request: Request, path: string) {
  const target = `${BACKEND}/${path}`;
  const init: RequestInit = {
    method: request.method,
    headers: filterHeaders(request.headers, new Set(['host','content-length','connection','origin'])),
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  };
  const resp = await fetch(target, init);
  // ⚠️ No reenvíes content-encoding/length ni hop-by-hop → evita ERR_CONTENT_DECODING_FAILED
  const headers = filterHeaders(resp.headers, new Set([...HOP_BY_HOP, ...ENCODING]));
  return new Response(resp.body, { status: resp.status, headers });
}

export const GET: RequestHandler = ({ params, request }) => forward(request, (params.path as unknown as string[]).join('/'));
export const POST: RequestHandler = ({ params, request }) => forward(request, (params.path as unknown as string[]).join('/'));
export const PUT: RequestHandler = ({ params, request }) => forward(request, (params.path as unknown as string[]).join('/'));
export const PATCH: RequestHandler = ({ params, request }) => forward(request, (params.path as unknown as string[]).join('/'));
export const DELETE: RequestHandler = ({ params, request }) => forward(request, (params.path as unknown as string[]).join('/'));
export const OPTIONS: RequestHandler = ({ params, request }) => forward(request, (params.path as unknown as string[]).join('/')); 