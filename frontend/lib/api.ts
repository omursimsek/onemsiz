// Tiny fetch wrapper for server/client usage
export type ApiError = { status: number; message: string; details?: unknown };

async function handle(res: Response) {
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const body = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '');
  if (!res.ok) {
    const message = (isJson && (body?.message || body?.error)) || res.statusText || 'Request failed';
    const err: ApiError = { status: res.status, message, details: body };
    throw err;
  }
  return body;
}

export async function apiGet<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  return handle(res);
}

export async function apiPost<T = any>(url: string, data?: any, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    body: data !== undefined ? JSON.stringify(data) : undefined,
    cache: 'no-store',
    ...init
  });
  return handle(res);
}

export async function apiPostForm<T = any>(url: string, formData: FormData, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
    cache: 'no-store',
    ...init
  });
  return handle(res);
}
