import type { ApiResponse } from './auth';
import type { PagedApiResponse } from './article';

export interface DepartmentDto {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  isHomepageFeatured: boolean;
  createdAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  isHomepageFeatured: boolean;
}

export interface UpdateDepartmentRequest {
  name: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  isHomepageFeatured: boolean;
}

export interface DoctorDto {
  id: string;
  fullName: string;
  academicTitle?: string | null;
  position?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  specialty?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  sortOrder: number;
  isActive: boolean;
  isManagement: boolean;
  managementOrder: number;
  isHomepageFeatured: boolean;
  createdAt: string;
}

export interface CreateDoctorRequest {
  fullName: string;
  academicTitle?: string | null;
  position?: string | null;
  departmentId?: string | null;
  specialty?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  sortOrder: number;
  isActive: boolean;
  isManagement: boolean;
  managementOrder: number;
  isHomepageFeatured: boolean;
}

export interface UpdateDoctorRequest {
  fullName: string;
  academicTitle?: string | null;
  position?: string | null;
  departmentId?: string | null;
  specialty?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  sortOrder: number;
  isActive: boolean;
  isManagement: boolean;
  managementOrder: number;
  isHomepageFeatured: boolean;
}

export type DepartmentListResponse = ApiResponse<DepartmentDto[]>;
export type PagedDoctorResponse = PagedApiResponse<DoctorDto[]>;
