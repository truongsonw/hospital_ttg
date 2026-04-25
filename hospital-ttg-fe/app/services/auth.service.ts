import { apiFetch, setTokenAccessors } from '~/lib/api';
import type { ChangePasswordRequest, TokenResponse, UserDto } from '~/types/auth';

const REFRESH_TOKEN_KEY = 'hospital_ttg_refresh_token';

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
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

// Wire up api.ts so it can inject tokens and call refresh
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
    // Fire-and-forget: always clear local state
  } finally {
    setAccessToken(null);
    setRefreshToken(null);
  }
}

export async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

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
      setRefreshToken(null);
      return false;
    }
    const data = await res.json();
    setAccessToken(data.data.accessToken);
    setRefreshToken(data.data.refreshToken);
    return true;
  } catch {
    setRefreshToken(null);
    return false;
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

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const body: ChangePasswordRequest = { currentPassword, newPassword };
  await apiFetch('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  // Backend revokes token after password change — clear local state
  setAccessToken(null);
  setRefreshToken(null);
}
