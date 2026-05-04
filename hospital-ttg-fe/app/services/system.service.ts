import { apiFetch } from '~/lib/api';
import type { DashboardStatsDto } from '~/types/system';

export async function getDashboardStats(): Promise<DashboardStatsDto> {
  const res = await apiFetch<DashboardStatsDto>('/api/system/stats');
  return res.data;
}
