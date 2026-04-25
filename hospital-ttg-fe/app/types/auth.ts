export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  succeeded: boolean;
  message: string;
}
