// @ts-nocheck
"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconContract,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconBook,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconMenu2,
  IconCategory,
  IconCategory2,
  IconNews,
} from "@tabler/icons-react"
import { Link } from "react-router"

import { NavBooks } from "~/components/nav-books"
import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
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

const data = {
  user: {
    name: "Trường Sơn",
    email: "truongson009385@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Bảng điều khiển",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Báo cáo thống kê",
      url: "#",
      icon: IconChartBar,
    },
  ],
  navSystem: [
    {
      title: "Quản lý Menu",
      url: "/dashboard/system/menus",
      icon: IconMenu2,
    },
    {
      title: "Danh mục hệ thống",
      url: "/dashboard/system/categories",
      icon: IconCategory,
    },
  ],
  navArticle: [
    {
      title: "Danh mục nội dung",
      url: "/dashboard/article/categories",
      icon: IconCategory2,
    },
    {
      title: "Quản lý nội dung",
      url: "/dashboard/article/contents",
      icon: IconNews,
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Hỗ trợ",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Tìm kiếm",
      url: "#",
      icon: IconSearch,
    },
  ],
  books: [
    {
      name: "Quản lý kho sách",
      url: "#",
      icon: IconContract,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:!p-1.5" render={<a href="/dashboard" />}>
              <IconBook className="!size-5" />
              <span className="text-base font-semibold">Hospital TTG</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

        {/* System module */}
        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSystem.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} render={<Link to={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Article module */}
        <SidebarGroup>
          <SidebarGroupLabel>Nội dung</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navArticle.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} render={<Link to={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavBooks items={data.books} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}



