/**
 * Storage URL resolution utility.
 *
 * Problem: previously the admin form stored full download URLs
 * (e.g. "http://localhost:5020/api/storage/{guid}/download") in SiteSettings.
 * This breaks when BASE_URL changes between environments.
 *
 * Solution: store only the file Guid in DB. Resolve to a full download URL
 * at render time using this module. Handles both:
 *   - new data: plain Guid string
 *   - legacy data: existing full URLs (backward-compat pass-through)
 */

import { BASE_URL } from "~/lib/api";

/** Matches a valid Guid (36 chars including hyphens) */
const GUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DOWNLOAD_TEMPLATE = `${BASE_URL}/api/storage/{id}/download`;

/**
 * Resolves a stored setting value to a usable URL.
 *
 * - If `value` is a Guid  → constructs a download URL
 * - If `value` is already a full URL → returns it as-is (legacy data)
 * - If `value` is empty/undefined → returns `fallback`
 */
export function resolveFileUrl(value: string | undefined | null, fallback = ""): string {
  if (!value) return fallback;
  if (GUID_REGEX.test(value.trim())) {
    return DOWNLOAD_TEMPLATE.replace("{id}", value.trim());
  }
  // Already a full URL — backward compat for existing DB data
  return value;
}

/**
 * Checks whether a value looks like a storage Guid (new format)
 * rather than a full URL (legacy format).
 */
export function isStorageGuid(value: string | undefined | null): boolean {
  return !!value && GUID_REGEX.test(value.trim());
}

/**
 * Extracts the Guid from a legacy full storage URL.
 * Returns undefined if the value is not a legacy storage URL.
 *
 * Example: "http://localhost:5020/api/storage/abc-123/def/ghi/download" → "abc-123"
 */
const STORAGE_URL_REGEX = /\/api\/storage\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export function extractGuidFromUrl(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const match = value.match(STORAGE_URL_REGEX);
  return match?.[1];
}

/**
 * Normalises a setting value that may be either a Guid or a legacy URL
 * into a consistent Guid string. Returns undefined if the value cannot
 * be parsed as either.
 */
export function normaliseFileId(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  if (isStorageGuid(value)) return value.trim();
  return extractGuidFromUrl(value);
}
