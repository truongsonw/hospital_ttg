import { apiFetch } from "~/lib/api";
import type { SearchResponse, SearchSuggestItem } from "~/types/search";

export async function search(query: string, page = 1, pageSize = 10): Promise<SearchResponse> {
  const q = new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) });
  const res = await apiFetch<SearchResponse>(`/api/search?${q}`);
  return res.data;
}

export async function getSearchSuggestions(query: string, limit = 5): Promise<SearchSuggestItem[]> {
  if (!query || query.length < 2) return [];
  const q = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await apiFetch<SearchSuggestItem[]>(`/api/search/suggest?${q}`);
  return res.data;
}
