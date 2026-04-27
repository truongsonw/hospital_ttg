import type { PagedApiResponse } from './article';

export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  Completed = 2,
  Cancelled = 3,
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  [BookingStatus.Pending]: 'Chờ xác nhận',
  [BookingStatus.Confirmed]: 'Đã xác nhận',
  [BookingStatus.Completed]: 'Hoàn thành',
  [BookingStatus.Cancelled]: 'Đã hủy',
};

export const BOOKING_STATUS_VARIANT: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [BookingStatus.Pending]: 'outline',
  [BookingStatus.Confirmed]: 'default',
  [BookingStatus.Completed]: 'secondary',
  [BookingStatus.Cancelled]: 'destructive',
};

export interface BookingDto {
  id: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  appointmentDate: string;
  symptoms: string | null;
  status: BookingStatus;
  note: string | null;
  createdAt: string;
}

export interface CreateBookingRequest {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  appointmentDate: string;
  symptoms?: string | null;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  note?: string | null;
}

export type PagedBookingResponse = PagedApiResponse<BookingDto[]>;
