"use client"

import * as React from "react"
import { BookOpen, Users } from "lucide-react"
import { Link } from "react-router"

import { getMenuIcon } from "~/lib/menu-icons"
import { NavUser } from "~/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "~/components/ui/sidebar"
import { useMenuItems } from "~/hooks/useMenuItems"
import { useAuth } from "~/context/auth.context"
import type { MenuDto } from "~/types/system"

function MenuIcon({ iconName }: { iconName?: string | null }) {
  const IconComponent = getMenuIcon(iconName)
  return <IconComponent className="size-4" />
}

function DynamicNavGroup({
  groupLabel,
  items,
}: {
  groupLabel: string
  items: MenuDto[]
}) {
  if (!items.length) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton tooltip={item.title} render={<Link to={item.url ?? "#"} />}>
                <MenuIcon iconName={item.icon} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebarDynamic({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { menuItems, loading } = useMenuItems()
  const { hasPermission } = useAuth()

  const topLevelGroups = React.useMemo(() => {
    if (!menuItems.length) return []

    return menuItems
      .filter((m) => m.url == null && m.isActive)
      .map((parent) => ({
        label: parent.title,
        children: (parent.children ?? []).filter((c) => c.isActive),
      }))
  }, [menuItems])

  if (loading) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5" render={<Link to="/dashboard" />}>
                <BookOpen className="!size-5" />
                <span className="text-base font-semibold">Hospital TTG</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent />
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5" render={<Link to="/dashboard" />}>
              <BookOpen className="!size-5" />
              <span className="text-base font-semibold">Hospital TTG</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Dynamic groups from menu tree */}
        {topLevelGroups.map((group) => (
          <DynamicNavGroup key={group.label} groupLabel={group.label} items={group.children} />
        ))}
        {/* Roles management — shown only if user has role.manage permission */}
        {hasPermission("role.manage") && (
          <SidebarGroup>
            <SidebarGroupLabel>Vai trò</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Vai trò" render={<Link to="/dashboard/roles" />}>
                    <Users />
                    <span>Vai trò</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
