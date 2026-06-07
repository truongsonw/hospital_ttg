import { Outlet, redirect } from "react-router";
import { AppSidebarDynamic } from "~/components/app-sidebar-dynamic";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import * as authService from "~/services/auth.service";
import { getRequiredPermissions, hasRequiredPermissions } from "~/lib/permissions";

export async function clientLoader({ request }: { request: Request }) {
  const isAuth = await authService.ensureAuthenticated();
  if (!isAuth) throw redirect("/login");

  const url = new URL(request.url);
  const pathname = url.pathname;

  // Permission check: verify user has the required permission for this route.
  // The required permission is resolved from ROUTE_PERMISSIONS map.
  // Backend is the source of truth for authorization — if frontend allows access
  // but backend denies, the API call will fail. If frontend denies but backend
  // allows, the UI simply hides the route.
  const me = await authService.getMeWithPermissions();
  const userPermissions = new Set<string>(me.permissions ?? []);
  const required = getRequiredPermissions(pathname);

  if (required !== null && !hasRequiredPermissions(required, userPermissions)) {
    throw redirect("/dashboard");
  }

  return null;
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <span className="text-muted-foreground">Đang tải...</span>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarDynamic variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
