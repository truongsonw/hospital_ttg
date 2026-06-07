import { apiFetch, setTokenAccessors } from '~/lib/api';
import type { ChangePasswordRequest, TokenResponse, UpdateMyProfileRequest, UserDto } from '~/types/auth';

export interface CurrentUser extends UserDto {
  permissions: string[];
}

const REFRESH_TOKEN_KEY = 'hospital_ttg_refresh_token';

let _accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

export function clearSession() {
  setAccessToken(null);
  setRefreshToken(null);
}

function setAccessToken(token: string | null) {
  _accessToken = token;
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

setTokenAccessors(getAccessToken, tryRefresh);

export async function login(username: string, password: string): Promise<void> {
  const res = await apiFetch<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setAccessToken(res.data.accessToken);
  setRefreshToken(res.data.refreshToken);
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch {
  } finally {
    clearSession();
  }
}

export async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(
        `${(import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5020'}/api/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(refreshToken),
        },
      );
      if (!res.ok) {
        clearSession();
        return false;
      }
      const data = await res.json();
      setAccessToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
      return true;
    } catch {
      clearSession();
      return false;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function ensureAuthenticated(): Promise<boolean> {
  if (_accessToken) return true;
  return tryRefresh();
}

export async function getMe(): Promise<UserDto> {
  const res = await apiFetch<UserDto>('/api/auth/me');
  return res.data;
}

export async function updateMe(payload: UpdateMyProfileRequest): Promise<UserDto> {
  const res = await apiFetch<UserDto>('/api/auth/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function getMeWithPermissions(): Promise<CurrentUser> {
  const res = await apiFetch<CurrentUser>('/api/auth/me/permissions');
  return res.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const body: ChangePasswordRequest = { currentPassword, newPassword };
  await apiFetch('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  clearSession();
}
