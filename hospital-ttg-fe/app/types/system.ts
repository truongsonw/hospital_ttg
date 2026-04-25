export interface MenuDto {
  id: string;
  parentId?: string | null;
  title: string;
  url?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
  children: MenuDto[];
}

export interface CreateMenuRequest {
  parentId?: string | null;
  title: string;
  url?: string | null;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
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
