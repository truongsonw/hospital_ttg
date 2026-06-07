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

export interface UserListItemDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserDetailDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  role: string;
  password: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface UpdateMyProfileRequest {
  fullName: string;
  email: string;
}

export interface ResetUserPasswordRequest {
  newPassword: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface RolePermissionDto {
  key: string;
  description: string;
}

export interface RolePermissionAssignmentDto {
  roleId: string;
  permissions: string[];
}

export interface AssignRolePermissionsRequest {
  roleId: string;
  permissions: string[];
}

export interface ApiResponse<T> {
  data: T;
  succeeded: boolean;
  message: string;
}
