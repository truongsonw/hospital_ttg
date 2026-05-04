import { apiFetch } from "~/lib/api";
import type { HomePageDto } from "~/types/home";

export async function getHomePage(): Promise<HomePageDto> {
  const res = await apiFetch<HomePageDto>("/api/homepage");
  return res.data;
}
