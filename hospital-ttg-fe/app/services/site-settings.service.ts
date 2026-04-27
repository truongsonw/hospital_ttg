import { apiFetch } from '~/lib/api';
import type { SiteSettingDto, UpdateSiteSettingsRequest } from '~/types/system';

export async function getAllSiteSettings(): Promise<SiteSettingDto[]> {
  const res = await apiFetch<SiteSettingDto[]>('/api/site-settings');
  return res.data;
}

export async function getSiteSettingsByGroup(group: string): Promise<SiteSettingDto[]> {
  const res = await apiFetch<SiteSettingDto[]>(`/api/site-settings/${group}`);
  return res.data;
}

export async function upsertSiteSettings(req: UpdateSiteSettingsRequest): Promise<SiteSettingDto[]> {
  const res = await apiFetch<SiteSettingDto[]>('/api/site-settings', {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  return res.data;
}

export function settingsToMap(settings: SiteSettingDto[]): Record<string, string> {
  return Object.fromEntries(settings.map((s) => [s.key, s.value ?? '']));
}
