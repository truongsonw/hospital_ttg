import type { ApiResponse } from '~/types/auth';

export const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5020';

// Circular-dependency-safe: auth.service sets these via setTokenAccessors()
let _getToken: () => string | null = () => null;
let _refreshTokens: () => Promise<boolean> = async () => false;
let _hasRefreshToken: () => boolean = () => false;

export function setTokenAccessors(
  getToken: () => string | null,
  refreshTokens: () => Promise<boolean>,
  hasRefreshToken?: () => boolean,
) {
  _getToken = getToken;
  _refreshTokens = refreshTokens;
  if (hasRefreshToken) _hasRefreshToken = hasRefreshToken;
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
  if (body?.detail && typeof body.detail === "string") return body.detail;
  if (body?.title && typeof body.title === "string") return body.title;
  if (status === 403) return "Bạn không có quyền thực hiện thao tác này.";
  return "Request failed";
}

function formatFieldErrors(errors: Record<string, string[]> | undefined): string | null {
  if (!errors) return null;
  const entries = Object.entries(errors).filter(([, msgs]) => Array.isArray(msgs) && msgs.length > 0);
  if (entries.length === 0) return null;
  return entries
    .map(([field, msgs]) => `${field}: ${msgs.join("; ")}`)
    .join("\n");
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
    const fieldErrors = body?.extensions?.errors ?? body?.errors;
    const detailed = formatFieldErrors(fieldErrors);
    const baseMessage = getErrorMessage(body, res.status);
    const message =
      detailed && baseMessage === "One or more validation errors occurred."
        ? detailed
        : baseMessage;
    const error = new ApiError(res.status, message, fieldErrors);
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
      if (typeof window !== 'undefined' && _hasRefreshToken()) {
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
    const fieldErrors = body?.extensions?.errors ?? body?.errors;
    const detailed = formatFieldErrors(fieldErrors);
    const baseMessage = getErrorMessage(body, res.status);
    const message =
      detailed && baseMessage === "One or more validation errors occurred."
        ? detailed
        : baseMessage;
    throw new ApiError(res.status, message, fieldErrors);
  }
  return readJson<ApiResponse<T>>(res);
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<ApiResponse<T>> {
  const token = _getToken();
  let res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok && res.status === 401) {
    const refreshed = await _refreshTokens();
    if (refreshed) {
      const newToken = _getToken();
      res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        body: formData,
        headers: newToken ? { Authorization: `Bearer ${newToken}` } : {},
      });
    } else if (typeof window !== 'undefined' && _hasRefreshToken()) {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const fieldErrors = body?.extensions?.errors ?? body?.errors;
    const detailed = formatFieldErrors(fieldErrors);
    const baseMessage = getErrorMessage(body, res.status);
    const message =
      detailed && baseMessage === "One or more validation errors occurred."
        ? detailed
        : baseMessage;
    throw new ApiError(res.status, message, fieldErrors);
  }

  return readJson<ApiResponse<T>>(res);
}

export async function apiUploadData<T>(path: string, formData: FormData): Promise<T> {
  const res = await apiUpload<T>(path, formData);
  return res.data;
}

export async function apiDownload(path: string, fileName: string): Promise<void> {
  const token = _getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    if (res.status === 401) {
      const refreshed = await _refreshTokens();
      if (refreshed) {
        const retryToken = _getToken();
        const retryRes = await fetch(`${BASE_URL}${path}`, {
          headers: retryToken ? { Authorization: `Bearer ${retryToken}` } : {},
        });
        if (!retryRes.ok) {
          throw new Error('Download thất bại');
        }
        const blob = await retryRes.blob();
        triggerDownload(blob, fileName);
        return;
      }
      if (typeof window !== 'undefined' && _hasRefreshToken()) {
        window.location.href = '/login';
      }
    }
    throw new Error('Download thất bại');
  }

  const blob = await res.blob();
  triggerDownload(blob, fileName);
}

function triggerDownload(blob: Blob, fileName: string): void {
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
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
