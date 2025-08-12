export type HttpGetOptions = {
  credentials?: 'include' | 'omit' | 'same-origin'; // "include" recomendado si usas cookies
  headers?: Record<string, string>;
};

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
  url: string,
  opts: HttpGetOptions = { credentials: 'include' }
): Promise<{ list: T[]; raw: unknown; total?: number }> {
  const res = await fetch(url, {
    method: 'GET',
    credentials: opts.credentials ?? 'include',
    headers: { ...(opts.headers || {}) },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${text}`.slice(0, 400));
  }

  const totalHeader = res.headers.get('X-Total-Count');
  const total = totalHeader ? Number(totalHeader) : undefined;

  let body: unknown = {};
  try { body = await res.json(); } catch { body = {}; }

  return { list: unwrapArrayShape(body) as T[], raw: body, total };
} 