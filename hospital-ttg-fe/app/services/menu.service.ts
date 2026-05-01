import { apiFetch } from '~/lib/api';
import type { AssignRoleMenuRequest, CreateMenuRequest, MenuDto, UpdateMenuRequest } from '~/types/system';

export async function getAllMenus(): Promise<MenuDto[]> {
  const res = await apiFetch<MenuDto[]>('/api/sysmenu');
  return res.data;
}

export async function getMenuById(id: string): Promise<MenuDto> {
  const res = await apiFetch<MenuDto>(`/api/sysmenu/${id}`);
  return res.data;
}

export async function createMenu(req: CreateMenuRequest): Promise<MenuDto> {
  const res = await apiFetch<MenuDto>('/api/sysmenu', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function updateMenu(id: string, req: UpdateMenuRequest): Promise<MenuDto> {
  const res = await apiFetch<MenuDto>(`/api/sysmenu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return res.data;
}

export async function deleteMenu(id: string): Promise<void> {
  await apiFetch<boolean>(`/api/sysmenu/${id}`, { method: 'DELETE' });
}

export async function getMenusByRole(roleId: string): Promise<MenuDto[]> {
  const res = await apiFetch<MenuDto[]>(`/api/sysmenu/role/${roleId}`);
  return res.data;
}

export async function assignMenusToRole(req: AssignRoleMenuRequest): Promise<void> {
  await apiFetch<boolean>('/api/sysmenu/role/assign', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}
