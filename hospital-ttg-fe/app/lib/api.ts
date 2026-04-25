import type { ApiResponse } from '~/types/auth';

export const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5020';

// Circular-dependency-safe: auth.service sets these via setTokenAccessors()
let _getToken: () => string | null = () => null;
let _refreshTokens: () => Promise<boolean> = async () => false;

export function setTokenAccessors(
  getToken: () => string | null,
  refreshTokens: () => Promise<boolean>,
) {
  _getToken = getToken;
  _refreshTokens = refreshTokens;
}

async function doFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = _getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new ApiError(res.status, body?.detail ?? body?.title ?? 'Request failed', body?.extensions?.errors);
    throw error;
  }

  return res.json() as Promise<ApiResponse<T>>;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    return await doFetch<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await _refreshTokens();
      if (refreshed) {
        return doFetch<T>(path, options);
      }
      // Redirect to login if refresh failed
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw err;
  }
}

async function doUpload<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
  const token = _getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.detail ?? body?.title ?? 'Upload failed', body?.extensions?.errors);
  }
  return res.json() as Promise<ApiResponse<T>>;
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
  try {
    return await doUpload<T>(path, formData);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await _refreshTokens();
      if (refreshed) return doUpload<T>(path, formData);
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    throw err;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
