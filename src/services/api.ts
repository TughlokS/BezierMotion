// ─────────────────────────────────────────────
//  HTTP Service  (axios / fetch wrapper)
//  Place all API calls here, not in components.
// ─────────────────────────────────────────────
import config from '../config';

const baseHeaders = {
  'Content-Type': 'application/json',
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.apiBaseUrl}${endpoint}`;
  const res = await fetch(url, { headers: baseHeaders, ...options });

  if (!res.ok) {
    throw new Error(`[API Error] ${res.status} ${res.statusText} – ${url}`);
  }

  return res.json() as Promise<T>;
}

const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};

export default api;
