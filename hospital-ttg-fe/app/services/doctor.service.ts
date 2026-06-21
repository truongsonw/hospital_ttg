import type { ApiResponse } from '~/types/auth';
import { apiFetch, apiFetchRaw, apiDownload, apiUploadData } from '~/lib/api';
import type { DoctorDto, CreateDoctorRequest, UpdateDoctorRequest, PagedDoctorResponse } from '~/types/doctor';

export interface DoctorImportResultDto {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: Array<{
    rowNumber: number;
    fullName: string;
    errorMessage: string;
  }>;
}

export async function getManagementDoctors(): Promise<DoctorDto[]> {
  const res = await apiFetch<DoctorDto[]>('/api/doctors/management');
  return res.data;
}

export async function getPagedDoctors(params: {
  departmentId?: string;
  groupId?: string;
  departmentSlug?: string;
  groupSlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedDoctorResponse> {
  const q = new URLSearchParams();
  if (params.departmentId) q.set('departmentId', params.departmentId);
  if (params.groupId) q.set('groupId', params.groupId);
  if (params.departmentSlug) q.set('departmentSlug', params.departmentSlug);
  if (params.groupSlug) q.set('groupSlug', params.groupSlug);
  if (params.search) q.set('search', params.search);
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 12));
  return apiFetchRaw<PagedDoctorResponse>(`/api/doctors?${q}`);
}

export async function getFeaturedDoctors(limit = 4): Promise<DoctorDto[]> {
  const res = await apiFetch<DoctorDto[]>(`/api/doctors/featured?limit=${limit}`);
  return res.data;
}

export async function getDoctorById(id: string): Promise<DoctorDto> {
  const res = await apiFetch<DoctorDto>(`/api/doctors/${id}`);
  return res.data;
}

export async function getDoctorBySlug(slug: string): Promise<DoctorDto> {
  const res = await apiFetch<DoctorDto>(`/api/doctors/slug/${slug}`);
  return res.data;
}

export async function createDoctor(req: CreateDoctorRequest): Promise<DoctorDto> {
  const res = await apiFetch<DoctorDto>('/api/doctors', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function updateDoctor(id: string, req: UpdateDoctorRequest): Promise<DoctorDto> {
  const res = await apiFetch<DoctorDto>(`/api/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function deleteDoctor(id: string): Promise<void> {
  await apiFetch<boolean>(`/api/doctors/${id}`, { method: 'DELETE' });
}

export async function importDoctors(file: File): Promise<DoctorImportResultDto> {
  const formData = new FormData();
  formData.append('file', file);
  return apiUploadData<DoctorImportResultDto>('/api/doctors/import', formData);
}

export function exportDoctors(): void {
  apiDownload('/api/doctors/export', `danh-sach-bac-si-${new Date().toISOString().slice(0, 10)}.xlsx`)
    .catch((err) => {
      console.error('Export error:', err);
      throw err;
    });
}

export function downloadDoctorTemplate(): void {
  apiDownload('/api/doctors/template', 'bac-si-template.xlsx')
    .catch((err) => {
      console.error('Download template error:', err);
      throw err;
    });
}
