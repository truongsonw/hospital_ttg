import { apiFetch } from '~/lib/api';
import type { CreateSysCategoryRequest, SysCategoryDto, UpdateSysCategoryRequest } from '~/types/system';

export async function getAllCategories(): Promise<SysCategoryDto[]> {
  const res = await apiFetch<SysCategoryDto[]>('/api/syscategory');
  return res.data;
}

export async function getCategoryById(id: string): Promise<SysCategoryDto> {
  const res = await apiFetch<SysCategoryDto>(`/api/syscategory/${id}`);
  return res.data;
}

export async function createCategory(req: CreateSysCategoryRequest): Promise<SysCategoryDto> {
  const res = await apiFetch<SysCategoryDto>('/api/syscategory', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function updateCategory(id: string, req: UpdateSysCategoryRequest): Promise<SysCategoryDto> {
  const res = await apiFetch<SysCategoryDto>(`/api/syscategory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<boolean>(`/api/syscategory/${id}`, { method: 'DELETE' });
}
