import { apiFetch, apiFetchData, apiFetchRaw } from '~/lib/api';
import type {
  AssignRolePermissionsRequest,
  CreateRoleRequest,
  CreateUserRequest,
  ResetUserPasswordRequest,
  RoleDto,
  RolePermissionAssignmentDto,
  RolePermissionDto,
  UpdateRoleRequest,
  UpdateRoleStatusRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserDetailDto,
  UserListItemDto,
} from '~/types/auth';
import type { PagedApiResponse } from '~/types/article';

export type PagedUsersResponse = PagedApiResponse<UserListItemDto[]>;

export async function getPagedUsers(params: {
  keyword?: string;
  role?: string;
  isActive?: boolean | '';
  page?: number;
  pageSize?: number;
}): Promise<PagedUsersResponse> {
  const q = new URLSearchParams();
  if (params.keyword) q.set('keyword', params.keyword);
  if (params.role) q.set('role', params.role);
  if (params.isActive !== '' && params.isActive !== undefined) q.set('isActive', String(params.isActive));
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 10));
  return apiFetchRaw<PagedUsersResponse>(`/api/users?${q}`);
}

export async function getUserById(id: string): Promise<UserDetailDto> {
  return apiFetchData<UserDetailDto>(`/api/users/${id}`);
}

export async function createUser(req: CreateUserRequest): Promise<UserDetailDto> {
  return apiFetchData<UserDetailDto>('/api/users', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updateUser(id: string, req: UpdateUserRequest): Promise<UserDetailDto> {
  return apiFetchData<UserDetailDto>(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
}

export async function updateUserStatus(id: string, req: UpdateUserStatusRequest): Promise<void> {
  await apiFetch(`/api/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(req),
  });
}

export async function resetUserPassword(id: string, req: ResetUserPasswordRequest): Promise<void> {
  await apiFetch(`/api/users/${id}/reset-password`, {
    method: 'PATCH',
    body: JSON.stringify(req),
  });
}

export async function getRoles(): Promise<RoleDto[]> {
  return apiFetchData<RoleDto[]>('/api/roles');
}

export async function getAllRolePermissions(): Promise<RolePermissionDto[]> {
  return apiFetchData<RolePermissionDto[]>('/api/roles/permissions');
}

export async function getRolePermissions(roleId: string): Promise<RolePermissionAssignmentDto> {
  return apiFetchData<RolePermissionAssignmentDto>(`/api/roles/${roleId}/permissions`);
}

export async function assignPermissionsToRole(roleId: string, req: AssignRolePermissionsRequest): Promise<void> {
  await apiFetch(`/api/roles/${roleId}/permissions`, {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function createRole(req: CreateRoleRequest): Promise<RoleDto> {
  return apiFetchData<RoleDto>('/api/roles', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updateRole(id: string, req: UpdateRoleRequest): Promise<RoleDto> {
  return apiFetchData<RoleDto>(`/api/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
}

export async function updateRoleStatus(id: string, req: UpdateRoleStatusRequest): Promise<void> {
  await apiFetch(`/api/roles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(req),
  });
}

export async function deleteRole(id: string): Promise<void> {
  await apiFetch(`/api/roles/${id}`, {
    method: 'DELETE',
  });
}
