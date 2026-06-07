"use client"

import {
  MoreVertical,
  LogOut,
  User,
  Globe,
} from "lucide-react"
import { useNavigate } from "react-router"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { useAuth } from "~/context/auth.context"
import { useMenuItems } from "~/hooks/useMenuItems"
import type { MenuDto } from "~/types/system"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function flattenMenus(nodes: MenuDto[]): MenuDto[] {
  const result: MenuDto[] = []

  for (const node of nodes) {
    result.push(node)
    if (node.children?.length) {
      result.push(...flattenMenus(node.children))
    }
  }

  return result
}

export function NavUser() {
  const { user, logout } = useAuth()
  const { menuItems } = useMenuItems()
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  if (!user) return null

  const flattenedMenuItems = flattenMenus(menuItems)
  const canAccessWebsite = flattenedMenuItems.some((menu) => menu.url === "/dashboard/settings/website")

  async function handleLogout() {
    await logout()
    navigate("/login", { replace: true })
  }

  function navigateTo(url: string) {
    navigate(url)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg grayscale">
              <AvatarFallback className="rounded-lg">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.fullName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
            <MoreVertical className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.fullName}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigateTo("/dashboard/profile")}>
                <User />
                Hồ sơ cá nhân
              </DropdownMenuItem>
              {canAccessWebsite && (
                <DropdownMenuItem onClick={() => navigateTo("/dashboard/settings/website")}>
                  <Globe />
                  Thông tin website
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
