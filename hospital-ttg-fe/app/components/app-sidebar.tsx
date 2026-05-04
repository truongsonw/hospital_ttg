// @ts-nocheck
"use client"

import * as React from "react"
import {
  Camera,
  BarChart3,
  LayoutDashboard,
  Sparkles,
  FileText,
  Folder,
  HelpCircle,
  BookOpen,
  List,
  FileBarChart,
  Search,
  Settings,
  Users,
  Menu,
  LayoutGrid,
  Grid3X3,
  Newspaper,
  Calendar,
  Mail,
  Stethoscope,
  Building2,
  User,
  Globe,
} from "lucide-react"
import { Link } from "react-router"

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
      icon: LayoutDashboard,
    },
    {
      title: "Báo cáo thống kê",
      url: "#",
      icon: BarChart3,
    },
  ],
  navSystem: [
    {
      title: "Menu hệ thống",
      url: "/dashboard/system/menus",
      icon: Menu,
    },
    {
      title: "Menu trang chủ",
      url: "/dashboard/system/public-menus",
      icon: Globe,
    },
    {
      title: "Danh mục hệ thống",
      url: "/dashboard/system/categories",
      icon: LayoutGrid,
    },
  ],
  navArticle: [
    {
      title: "Danh mục nội dung",
      url: "/dashboard/article/categories",
      icon: Grid3X3,
    },
    {
      title: "Quản lý nội dung",
      url: "/dashboard/article/contents",
      icon: Newspaper,
    },
  ],
  navReception: [
    {
      title: "Đặt lịch khám",
      url: "/dashboard/bookings",
      icon: Calendar,
    },
    {
      title: "Liên hệ",
      url: "/dashboard/contacts",
      icon: Mail,
    },
  ],
  navDoctors: [
    {
      title: "Quản lý bác sĩ",
      url: "/dashboard/doctors",
      icon: Stethoscope,
    },
    {
      title: "Quản lý khoa",
      url: "/dashboard/doctors/departments",
      icon: Building2,
    },
  ],
  navSecondary: [
    {
      title: "Tài khoản",
      url: "/dashboard/settings/account",
      icon: User,
    },
    {
      title: "Thông tin website",
      url: "/dashboard/settings/website",
      icon: Globe,
    },
    {
      title: "Hỗ trợ",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Tìm kiếm",
      url: "#",
      icon: Search,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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

        {/* Reception module */}
        <SidebarGroup>
          <SidebarGroupLabel>Tiếp nhận</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navReception.map((item) => (
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

        {/* Doctors module */}
        <SidebarGroup>
          <SidebarGroupLabel>Bác sĩ</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navDoctors.map((item) => (
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

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
