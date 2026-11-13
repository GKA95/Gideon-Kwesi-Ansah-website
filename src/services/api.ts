let memoryCsrfToken = '';

export function setCsrfToken(token: string) {
  memoryCsrfToken = token;
}

export function getCsrfToken(): string {
  return memoryCsrfToken;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: Record<string, unknown>;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
    this.code = typeof data?.error === 'string' ? data.error : undefined;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers || {});
  if (!isFormData && !headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (
    url.startsWith('/api/admin') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) &&
    memoryCsrfToken
  ) {
    headers.set('X-CSRF-Token', memoryCsrfToken);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const text = await res.text();
  let parsed: Record<string, unknown> = {};
  if (text) {
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      parsed = { error: text };
    }
  }

  if (!res.ok) {
    const errMsg =
      (typeof parsed.message === 'string' && parsed.message) ||
      (typeof parsed.error === 'string' && parsed.error) ||
      `Request failed (${res.status})`;
    throw new ApiError(errMsg, res.status, parsed);
  }

  return parsed as T;
}
