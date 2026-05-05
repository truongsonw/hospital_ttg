import type { ApiResponse } from './auth';

// Pagination wrapper — matches backend PagedResponse<T> serialisation
export interface PagedApiResponse<T> extends ApiResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

// ── Category ──────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  type: string;
  lang: string;
  sortOrder: number;
  isActive: boolean;
  isHomepageFeatured: boolean;
  homepageSubtitle: string | null;
  homepageDescription: string | null;
  homepageButtonText: string | null;
  homepageButtonUrl: string | null;
  homepageLimit: number | null;
}

export interface CreateCategoryRequest {
  parentId?: string | null;
  name: string;
  slug: string;
  type: string;
  lang: string;
  sortOrder: number;
  isActive: boolean;
  isHomepageFeatured: boolean;
  homepageSubtitle?: string | null;
  homepageDescription?: string | null;
  homepageButtonText?: string | null;
  homepageButtonUrl?: string | null;
  homepageLimit?: number | null;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

// ── Content ───────────────────────────────────────────────────────────────────

export interface ContentDto {
  id: string;
  categoryId: string;
  contentType: string;
  title: string;
  slug: string;
  intro: string | null;
  body: string | null;
  thumbnail: string | null;
  fileAttach: string | null;
  pdfViewMode: string | null;
  tags: string | null;
  status: number;
  isHot: boolean;
  isHomepageFeatured: boolean;
  viewCount: number;
  publishedAt: string | null;
}

export interface CreateContentRequest {
  categoryId: string;
  contentType: string;
  title: string;
  slug: string;
  intro?: string | null;
  body?: string | null;
  thumbnail?: string | null;
  fileAttach?: string | null;
  pdfViewMode?: string | null;
  tags?: string | null;
  status: number;
  isHot: boolean;
  isHomepageFeatured: boolean;
  publishedAt?: string | null;
}

export interface UpdateContentRequest extends CreateContentRequest {}
