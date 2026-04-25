import { apiFetch } from '~/lib/api';
import type { ContentDto, CreateContentRequest, PagedApiResponse, UpdateContentRequest } from '~/types/article';

export async function getPagedContents(params: {
  type?: string;
  categoryId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedApiResponse<ContentDto[]>> {
  const q = new URLSearchParams();
  if (params.type) q.set('type', params.type);
  if (params.categoryId) q.set('categoryId', params.categoryId);
  if (params.status !== '' && params.status !== undefined) q.set('status', params.status);
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 10));
  const res = await apiFetch<ContentDto[]>(`/api/contents?${q}`);
  return res as unknown as PagedApiResponse<ContentDto[]>;
}

export async function getContentById(id: string): Promise<ContentDto> {
  const res = await apiFetch<ContentDto>(`/api/contents/${id}`);
  return (res.data ?? res) as unknown as ContentDto;
}

export async function createContent(req: CreateContentRequest): Promise<ContentDto> {
  const res = await apiFetch<ContentDto>('/api/contents', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return (res.data ?? res) as unknown as ContentDto;
}

export async function updateContent(id: string, req: UpdateContentRequest): Promise<ContentDto> {
  const res = await apiFetch<ContentDto>(`/api/contents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return (res.data ?? res) as unknown as ContentDto;
}

export async function deleteContent(id: string): Promise<void> {
  await apiFetch<void>(`/api/contents/${id}`, { method: 'DELETE' });
}

export async function getContentBySlug(slug: string): Promise<ContentDto | null> {
  try {
    const res = await apiFetch<ContentDto>(`/api/contents/slug/${slug}`);
    return (res.data ?? res) as unknown as ContentDto;
  } catch {
    return null;
  }
}

export async function incrementViewCount(id: string): Promise<void> {
  await apiFetch<void>(`/api/contents/${id}/view`, { method: 'POST' });
}
