/**
 * Route-to-permission mapping for frontend route guards.
 *
 * Each dashboard route maps to one or more permission keys that the backend
 * also enforces via RolePermissions + authorization policies.
 *
 * These values must match the permission constants in
 * HospitalTTG/Modules.Auth/Permissions/Permissions.cs.
 *
 * null  = no route-level guard (authenticated users may access freely)
 * string = one required permission
 * string[] = all required permissions
 */
export const ROUTE_PERMISSIONS: Record<string, string | string[] | null> = {
  // ── Admin management ─────────────────────────────────────────
  "/dashboard/users":           "user.manage",
  "/dashboard/roles":           "role.manage",

  // ── Article ─────────────────────────────────────────────────
  "/dashboard/article/categories": "category.manage",
  "/dashboard/article/contents":   "article_content.manage",
  "/dashboard/article/contents/create": "article_content.manage",
  "/dashboard/article/contents/*/edit": "article_content.manage",

  // ── Bookings ────────────────────────────────────────────────
  "/dashboard/bookings":  "booking.manage",

  // ── Contacts ────────────────────────────────────────────────
  "/dashboard/contacts": "contact.manage",

  // ── Doctors & Departments ──────────────────────────────────
  "/dashboard/doctors":             "doctor.manage",
  "/dashboard/doctors/departments": "department.manage",

  // ── System ─────────────────────────────────────────────────
  "/dashboard/system/menus":         "menu.manage",
  "/dashboard/system/public-menus":  "public_menu.manage",
  "/dashboard/system/categories":   "category.manage",

  // ── Settings ───────────────────────────────────────────────
  "/dashboard/settings/website":  "site_settings.manage",
  "/dashboard/settings":          null, // allowed for all authenticated users

  // ── Dashboard index ─────────────────────────────────────────
  "/dashboard": null,
};

/**
 * Returns the required permission(s) for a given pathname.
 * null  = no permission guard required (route is open to all authenticated users)
 * string = single required permission
 * string[] = multiple required permissions
 */
export function getRequiredPermissions(pathname: string): string | string[] | null {
  // Exact match first
  if (pathname in ROUTE_PERMISSIONS) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Longest-prefix match: find the most specific route that is a prefix of pathname
  let bestMatch: string | string[] | null = null;
  let bestLen = 0;

  for (const route of Object.keys(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      if (route.length > bestLen) {
        bestLen = route.length;
        bestMatch = ROUTE_PERMISSIONS[route];
      }
    }
  }

  return bestMatch;
}

/**
 * Checks whether the given set of user permissions satisfies the required permissions for a route.
 */
export function hasRequiredPermissions(
  required: string | string[] | null,
  userPermissions: ReadonlySet<string>,
): boolean {
  if (required === null) return true;
  if (typeof required === "string") return userPermissions.has(required);
  return required.every(p => userPermissions.has(p));
}
