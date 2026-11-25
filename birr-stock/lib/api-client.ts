/**
 * BirrStock Unified API Client
 * Connects Next.js frontend to the Node.js backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    return {
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data?.message || response.statusText,
      status: response.status,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    return {
      error: message,
      status: 503,
    };
  }
}

export const api = {
  health: () => apiClient<{ status: string; version: string }>('/health'),
  systemInfo: () => apiClient<unknown>('/system/info'),
};
