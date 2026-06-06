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

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'succeeded' in value
  );
}

async function readJson<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function getErrorMessage(body: any, status: number) {
  if (body?.detail) return body.detail;
  if (body?.title) return body.title;
  if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  return 'Request failed';
}

async function doFetchRaw<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = _getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new ApiError(res.status, getErrorMessage(body, res.status), body?.extensions?.errors ?? body?.errors);
    throw error;
  }

  return readJson<T>(res);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return apiFetchRaw<ApiResponse<T>>(path, options);
}

export async function apiFetchRaw<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    return await doFetchRaw<T>(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const refreshed = await _refreshTokens();
      if (refreshed) {
        return doFetchRaw<T>(path, options);
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw err;
  }
}

export async function apiFetchData<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetchRaw<ApiResponse<T> | T>(path, options);
  return isApiResponse<T>(res) ? res.data : res;
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
    throw new ApiError(res.status, getErrorMessage(body, res.status), body?.extensions?.errors ?? body?.errors);
  }
  return readJson<ApiResponse<T>>(res);
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
