import { getApiBaseUrl, getAuthToken } from './runtime';

/**
 * Description: Implements apiFetch.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function apiFetch<TResponse>(url: string, options: RequestInit = {}): Promise<TResponse> {
  const token = getAuthToken();
  const { signal: _signal, ...requestOptions } = options;
  const response = await fetch(`${getApiBaseUrl()}${url}`, {
    ...requestOptions,
    headers: {
      ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...requestOptions.headers
    }
  });

  const payload = await response.json().catch(() => ({}));
  const result = { data: payload, status: response.status, headers: response.headers };

  if (!response.ok) {
    throw result;
  }

  return result as TResponse;
}
