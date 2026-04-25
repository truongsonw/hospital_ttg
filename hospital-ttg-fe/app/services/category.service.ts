import { apiFetch } from '~/lib/api';
import type { CategoryDto, CreateCategoryRequest, PagedApiResponse, UpdateCategoryRequest } from '~/types/article';

export async function getPagedCategories(params: {
  type?: string;
  lang?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedApiResponse<CategoryDto[]>> {
  const q = new URLSearchParams();
  if (params.type) q.set('type', params.type);
  if (params.lang) q.set('lang', params.lang);
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 10));
  const res = await apiFetch<CategoryDto[]>(`/api/categories?${q}`);
  return res as unknown as PagedApiResponse<CategoryDto[]>;
}

export async function getAllCategoriesList(): Promise<CategoryDto[]> {
  const res = await getPagedCategories({ page: 1, pageSize: 999 });
  return res.data ?? [];
}

export async function getCategoryById(id: string): Promise<CategoryDto> {
  const res = await apiFetch<CategoryDto>(`/api/categories/${id}`);
  // GetById returns raw DTO (not wrapped in ApiResponse)
  return (res.data ?? res) as unknown as CategoryDto;
}

export async function createCategory(req: CreateCategoryRequest): Promise<CategoryDto> {
  const res = await apiFetch<CategoryDto>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return (res.data ?? res) as unknown as CategoryDto;
}

export async function updateCategory(id: string, req: UpdateCategoryRequest): Promise<CategoryDto> {
  const res = await apiFetch<CategoryDto>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return (res.data ?? res) as unknown as CategoryDto;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<void>(`/api/categories/${id}`, { method: 'DELETE' });
}
