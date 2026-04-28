import { useLocation, matchPath } from "react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"

const dashboardTitles = [
  { path: "/dashboard", title: "Bảng điều khiển" },
  { path: "/dashboard/settings", title: "Cài đặt" },
  { path: "/dashboard/system/menus", title: "Quản lý Menu" },
  { path: "/dashboard/system/categories", title: "Danh mục hệ thống" },
  { path: "/dashboard/article/categories", title: "Danh mục nội dung" },
  { path: "/dashboard/article/contents/create", title: "Thêm nội dung" },
  { path: "/dashboard/article/contents/:id/edit", title: "Sửa nội dung" },
  { path: "/dashboard/article/contents", title: "Quản lý nội dung" },
  { path: "/dashboard/bookings", title: "Đặt lịch khám" },
  { path: "/dashboard/contacts", title: "Liên hệ" },
  { path: "/dashboard/doctors/departments", title: "Quản lý khoa" },
  { path: "/dashboard/doctors", title: "Quản lý bác sĩ" },
]

function getDashboardTitle(pathname: string) {
  return (
    dashboardTitles.find((item) =>
      matchPath({ path: item.path, end: true }, pathname)
    )?.title ?? "Hospital TTG"
  )
}

export function SiteHeader() {
  const location = useLocation()
  const pageTitle = getDashboardTitle(location.pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 text-base font-medium">
                {pageTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {/* <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div> */}
      </div>
    </header>
  )
}
