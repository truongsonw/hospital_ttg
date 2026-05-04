export enum MenuType {
  Admin = 0,
  Public = 1,
}

export interface MenuDto {
  id: string;
  parentId?: string | null;
  title: string;
  url?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  type: MenuType;
  children: MenuDto[];
}

export interface CreateMenuRequest {
  parentId?: string | null;
  title: string;
  url?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  type: MenuType;
}

export interface UpdateMenuRequest {
  parentMenuId?: string | null;
  title: string;
  url?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  isExternal: boolean;
}

export interface AssignRoleMenuRequest {
  roleId: string;
  menuIds: string[];
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface RoleMenuDto {
  roleMenuId: string;
  roleId: string;
  menuId: string;
  canView: boolean;
}

export interface SysCategoryDto {
  id: string;
  code?: string | null;
  name?: string | null;
  type: number;
  description?: string | null;
  active?: boolean | null;
  deleted?: boolean | null;
  createBy?: number | null;
  createDTG?: string | null;
  updateBy?: number | null;
  updateDTG?: string | null;
  parentId?: string | null;
  ext1s?: string | null;
  ext1d?: number | null;
}

export interface CreateSysCategoryRequest {
  code?: string | null;
  name?: string | null;
  type: number;
  description?: string | null;
  active?: boolean | null;
  parentId?: string | null;
  ext1s?: string | null;
  ext1d?: number | null;
}

export interface UpdateSysCategoryRequest {
  code?: string | null;
  name?: string | null;
  type: number;
  description?: string | null;
  active?: boolean | null;
  parentId?: string | null;
  ext1s?: string | null;
  ext1d?: number | null;
}

export interface SiteSettingDto {
  key: string;
  value?: string | null;
  group: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface SiteSettingItem {
  key: string;
  value?: string | null;
}

export interface UpdateSiteSettingsRequest {
  settings: SiteSettingItem[];
}

export interface DashboardContentStatsDto {
  total: number;
  published: number;
  draft: number;
  hot: number;
  newLast7Days: number;
}

export interface DashboardBookingStatsDto {
  total: number;
  pending: number;
  confirmed: number;
  newLast7Days: number;
}

export interface DashboardContactStatsDto {
  total: number;
  unread: number;
  replied: number;
  newLast7Days: number;
}

export interface DashboardDoctorStatsDto {
  total: number;
  active: number;
  management: number;
  newLast7Days: number;
}

export interface DashboardStatsDto {
  contents: DashboardContentStatsDto;
  bookings: DashboardBookingStatsDto;
  contacts: DashboardContactStatsDto;
  doctors: DashboardDoctorStatsDto;
  generatedAtUtc: string;
}
