import { apiFetch, apiFetchRaw } from '~/lib/api';
import type { BookingDto, CreateBookingRequest, PagedBookingResponse, UpdateBookingStatusRequest } from '~/types/booking';
import { BookingStatus } from '~/types/booking';

export async function getPagedBookings(params: {
  status?: BookingStatus | '';
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedBookingResponse> {
  const q = new URLSearchParams();
  if (params.status !== '' && params.status !== undefined) q.set('status', String(params.status));
  if (params.search) q.set('search', params.search);
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 10));
  return apiFetchRaw<PagedBookingResponse>(`/api/bookings?${q}`);
}

export async function getBookingById(id: string): Promise<BookingDto> {
  const res = await apiFetch<BookingDto>(`/api/bookings/${id}`);
  return res.data;
}

export async function updateBookingStatus(id: string, req: UpdateBookingStatusRequest): Promise<BookingDto> {
  const res = await apiFetch<BookingDto>(`/api/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function createBooking(req: CreateBookingRequest): Promise<BookingDto> {
  const res = await apiFetch<BookingDto>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function deleteBooking(id: string): Promise<void> {
  await apiFetch<boolean>(`/api/bookings/${id}`, { method: 'DELETE' });
}
