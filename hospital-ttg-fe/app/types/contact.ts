import type { PagedApiResponse } from './article';

export enum ContactStatus {
  Unread = 0,
  Read = 1,
  Replied = 2,
}

export const CONTACT_STATUS_LABEL: Record<ContactStatus, string> = {
  [ContactStatus.Unread]: 'Chưa đọc',
  [ContactStatus.Read]: 'Đã đọc',
  [ContactStatus.Replied]: 'Đã phản hồi',
};

export const CONTACT_STATUS_VARIANT: Record<ContactStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [ContactStatus.Unread]: 'destructive',
  [ContactStatus.Read]: 'secondary',
  [ContactStatus.Replied]: 'default',
};

export interface ContactDto {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  content: string;
  status: ContactStatus;
  createdAt: string;
}

export interface CreateContactRequest {
  fullName: string;
  email: string;
  subject: string;
  content: string;
}

export interface UpdateContactStatusRequest {
  status: ContactStatus;
}

export type PagedContactResponse = PagedApiResponse<ContactDto[]>;
