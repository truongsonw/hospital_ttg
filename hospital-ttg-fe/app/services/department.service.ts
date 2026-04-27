import { apiFetch } from '~/lib/api';
import type { DepartmentDto, CreateDepartmentRequest, UpdateDepartmentRequest } from '~/types/doctor';
import type { ApiResponse } from '~/types/auth';

export async function getAllDepartments(isActive?: boolean): Promise<DepartmentDto[]> {
  const q = new URLSearchParams();
  if (isActive !== undefined) q.set('isActive', String(isActive));
  const res = await apiFetch<DepartmentDto[]>(`/api/departments?${q}`);
  return res.data;
}

export async function createDepartment(req: CreateDepartmentRequest): Promise<DepartmentDto> {
  const res = await apiFetch<DepartmentDto>('/api/departments', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function updateDepartment(id: string, req: UpdateDepartmentRequest): Promise<DepartmentDto> {
  const res = await apiFetch<DepartmentDto>(`/api/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiFetch<boolean>(`/api/departments/${id}`, { method: 'DELETE' });
}
