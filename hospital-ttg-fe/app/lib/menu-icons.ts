import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const IGNORED_EXPORTS = new Set([
  "Icon",
  "createLucideIcon",
  "icons",
  "default",
]);

function isSupportedLucideIconName(name: string): boolean {
  return /^[A-Z]/.test(name) && !name.endsWith("Icon") && !IGNORED_EXPORTS.has(name);
}

const entries = Object.entries(LucideIcons).filter(([name, value]) => {
  return isSupportedLucideIconName(name) && typeof value === "object" && value !== null;
});

export const SUPPORTED_MENU_ICONS = entries
  .map(([name]) => name)
  .sort((a, b) => a.localeCompare(b, "en"));

export type SupportedMenuIconName = (typeof SUPPORTED_MENU_ICONS)[number];

export const MENU_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  entries.map(([name, icon]) => [name, icon as LucideIcon]),
);

export const DEFAULT_MENU_ICON: LucideIcon = (LucideIcons.FileText ?? LucideIcons.CircleHelp) as LucideIcon;

export function getMenuIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return DEFAULT_MENU_ICON;
  return MENU_ICON_MAP[iconName] ?? DEFAULT_MENU_ICON;
}
