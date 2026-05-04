import type { ContentDto } from "./article";
import type { DepartmentDto, DoctorDto } from "./doctor";

export interface HomePageSlideDto {
  imageUrl: string;
  altText?: string | null;
  title?: string | null;
  description?: string | null;
  linkUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface HomePageQuickActionDto {
  key: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  url?: string | null;
  kind: string;
  sortOrder: number;
  isActive: boolean;
}

export interface HomePageSectionDto {
  subtitle?: string | null;
  title?: string | null;
  description?: string | null;
  buttonText?: string | null;
  buttonUrl?: string | null;
}

export interface HomePageContactDto {
  hotline?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  workingHours?: string | null;
}

export interface HomePageDto {
  heroSlides: HomePageSlideDto[];
  quickActions: HomePageQuickActionDto[];
  departments: DepartmentDto[];
  featuredServicesSection: HomePageSectionDto;
  featuredServices: ContentDto[];
  featuredNewsSection: HomePageSectionDto;
  featuredNews: ContentDto[];
  featuredDoctors: DoctorDto[];
  contact: HomePageContactDto;
}
