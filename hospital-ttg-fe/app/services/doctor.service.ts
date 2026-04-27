import { apiFetch } from '~/lib/api';
import type { DoctorDto, CreateDoctorRequest, UpdateDoctorRequest, PagedDoctorResponse } from '~/types/doctor';

export async function getManagementDoctors(): Promise<DoctorDto[]> {
  const res = await apiFetch<DoctorDto[]>('/api/doctors/management');
  return res.data;
}

export async function getPagedDoctors(params: {
  departmentId?: string;
  groupId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedDoctorResponse> {
  const q = new URLSearchParams();
  if (params.departmentId) q.set('departmentId', params.departmentId);
  if (params.groupId) q.set('groupId', params.groupId);
  if (params.search) q.set('search', params.search);
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 12));
  const res = await apiFetch<DoctorDto[]>(`/api/doctors?${q}`);
  return res as unknown as PagedDoctorResponse;
}

export async function getFeaturedDoctors(limit = 4): Promise<DoctorDto[]> {
  const res = await apiFetch<DoctorDto[]>(`/api/doctors/featured?limit=${limit}`);
  return res.data;
}

export async function getDoctorById(id: string): Promise<DoctorDto> {
  const res = await apiFetch<DoctorDto>(`/api/doctors/${id}`);
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
