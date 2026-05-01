import { apiFetch, apiFetchRaw } from '~/lib/api';
import type {
  ContactDto,
  CreateContactRequest,
  PagedContactResponse,
  ReplyContactRequest,
  UpdateContactStatusRequest,
} from '~/types/contact';
import { ContactStatus } from '~/types/contact';

export async function getPagedContacts(params: {
  status?: ContactStatus | '';
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PagedContactResponse> {
  const q = new URLSearchParams();
  if (params.status !== '' && params.status !== undefined) q.set('status', String(params.status));
  if (params.search) q.set('search', params.search);
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 10));
  return apiFetchRaw<PagedContactResponse>(`/api/contacts?${q}`);
}

export async function getContactById(id: string): Promise<ContactDto> {
  const res = await apiFetch<ContactDto>(`/api/contacts/${id}`);
  return res.data;
}

export async function updateContactStatus(id: string, req: UpdateContactStatusRequest): Promise<ContactDto> {
  const res = await apiFetch<ContactDto>(`/api/contacts/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function replyContact(id: string, req: ReplyContactRequest): Promise<ContactDto> {
  const res = await apiFetch<ContactDto>(`/api/contacts/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function createContact(req: CreateContactRequest): Promise<ContactDto> {
  const res = await apiFetch<ContactDto>('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function deleteContact(id: string): Promise<void> {
  await apiFetch<boolean>(`/api/contacts/${id}`, { method: 'DELETE' });
}
