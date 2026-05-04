import * as React from "react"
import { Link } from "react-router"
import {
  Building2,
  Calendar,
  Grid3X3,
  ChevronRight,
  Mail,
  Menu,
  Newspaper,
  User,
  Globe,
  Stethoscope,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { getDashboardStats } from "~/services/system.service"
import type { DashboardStatsDto } from "~/types/system"
import type { Route } from "./+types/index"

const numberFormatter = new Intl.NumberFormat("vi-VN")

const quickLinks = [
  {
    title: "Quản lý nội dung",
    description: "Bài viết, tin tức và nội dung hiển thị",
    to: "/dashboard/article/contents",
    icon: Newspaper,
  },
  {
    title: "Đặt lịch khám",
    description: "Danh sách lịch hẹn và trạng thái xử lý",
    to: "/dashboard/bookings",
    icon: Calendar,
  },
  {
    title: "Liên hệ",
    description: "Tin nhắn và phản hồi từ bệnh nhân",
    to: "/dashboard/contacts",
    icon: Mail,
  },
  {
    title: "Quản lý bác sĩ",
    description: "Hồ sơ bác sĩ và ban lãnh đạo",
    to: "/dashboard/doctors",
    icon: Stethoscope,
  },
  {
    title: "Danh mục nội dung",
    description: "Phân nhóm bài viết và nội dung",
    to: "/dashboard/article/categories",
    icon: Grid3X3,
  },
  {
    title: "Quản lý khoa",
    description: "Danh sách khoa phòng và sắp xếp",
    to: "/dashboard/doctors/departments",
    icon: Building2,
  },
  {
    title: "Quản lý menu",
    description: "Điều hướng và cấu trúc menu site",
    to: "/dashboard/system/menus",
    icon: Menu,
  },
  {
    title: "Tài khoản",
    description: "Thông tin đăng nhập và đổi mật khẩu",
    to: "/dashboard/settings/account",
    icon: User,
  },
  {
    title: "Thông tin website",
    description: "Cấu hình chung cho website",
    to: "/dashboard/settings/website",
    icon: Globe,
  },
] as const

type DashboardGroupKey = Exclude<keyof DashboardStatsDto, "generatedAtUtc">

type StatGroupConfig<K extends DashboardGroupKey> = {
  title: string
  description: string
  totalLabel: string
  icon: React.ComponentType<{ className?: string }>
  totalKey: K
  accentClassName: string
  items: {
    label: string
    key: keyof DashboardStatsDto[K]
  }[]
}

function defineStatGroup<K extends DashboardGroupKey>(config: StatGroupConfig<K>) {
  return config
}

const statGroups = [
  defineStatGroup({
    title: "Nội dung",
    description: "Tổng hợp bài viết và tin tức",
    totalLabel: "Tổng nội dung",
    icon: Newspaper,
    totalKey: "contents",
    accentClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    items: [
      { label: "Đã xuất bản", key: "published" },
      { label: "Bản nháp", key: "draft" },
      { label: "Nổi bật", key: "hot" },
      { label: "Mới 7 ngày", key: "newLast7Days" },
    ],
  }),
  defineStatGroup({
    title: "Đặt lịch khám",
    description: "Theo dõi lịch hẹn của bệnh nhân",
    totalLabel: "Tổng lịch hẹn",
    icon: Calendar,
    totalKey: "bookings",
    accentClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    items: [
      { label: "Chờ xác nhận", key: "pending" },
      { label: "Đã xác nhận", key: "confirmed" },
      { label: "Mới 7 ngày", key: "newLast7Days" },
    ],
  }),
  defineStatGroup({
    title: "Liên hệ",
    description: "Tin nhắn và phản hồi từ người dùng",
    totalLabel: "Tổng liên hệ",
    icon: Mail,
    totalKey: "contacts",
    accentClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    items: [
      { label: "Chưa đọc", key: "unread" },
      { label: "Đã phản hồi", key: "replied" },
      { label: "Mới 7 ngày", key: "newLast7Days" },
    ],
  }),
  defineStatGroup({
    title: "Quản lý bác sĩ",
    description: "Hồ sơ bác sĩ và đội ngũ lãnh đạo",
    totalLabel: "Tổng bác sĩ",
    icon: Stethoscope,
    totalKey: "doctors",
    accentClassName: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    items: [
      { label: "Đang hoạt động", key: "active" },
      { label: "Ban lãnh đạo", key: "management" },
      { label: "Mới 7 ngày", key: "newLast7Days" },
    ],
  }),
] as const

function formatCount(value: number) {
  return numberFormatter.format(value)
}

function DashboardStatSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-10 w-24" />
        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardStatCard({
  stats,
  config,
}: {
  stats: DashboardStatsDto
  config: (typeof statGroups)[number]
}) {
  const group = stats[config.totalKey] as unknown as Record<string, number>
  const Icon = config.icon

  return (
    <Card className="group overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="border-b border-border/60 bg-gradient-to-r from-muted/40 via-background to-background">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardDescription>{config.description}</CardDescription>
            <CardTitle className="text-xl font-semibold">{config.title}</CardTitle>
          </div>
          <CardAction>
            <div className={`rounded-xl p-2 ${config.accentClassName}`}>
              <Icon className="size-5" />
            </div>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {config.totalLabel}
            </p>
            <div className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
              {formatCount(group.total)}
            </div>
          </div>
          <Badge variant="outline" className="rounded-full border-border/70 px-3 py-1">
            Mới 7 ngày: {formatCount(group.newLast7Days)}
          </Badge>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {config.items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <Badge variant="outline" className="rounded-full px-2.5">
                {formatCount(group[item.key as string] ?? 0)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QuickLinkCard({
  title,
  description,
  to,
  icon: Icon,
}: (typeof quickLinks)[number]) {
  return (
    <Link
      to={to}
      className="group flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Icon className="size-5" />
        </div>
        <ChevronRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="mt-4 space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </Link>
  )
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Tổng quan Dashboard | Hospital TTG" }]
}

export default function DashboardIndex() {
  const [stats, setStats] = React.useState<DashboardStatsDto | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null)

  const loadStats = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getDashboardStats()
      setStats(data)
      setUpdatedAt(new Date(data.generatedAtUtc))
    } catch {
      setError("Không tải được số liệu bảng điều khiển. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadStats()
  }, [loadStats])

  const formattedUpdatedAt = updatedAt
    ? updatedAt.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  return (
    <div className="space-y-6">
      {error ? (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <AlertTitle>Không thể tải dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => void loadStats()}>
              Thử lại
            </Button>
          </div>
        </Alert>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Lối tắt nhanh</h2>
            <p className="text-sm text-muted-foreground">
              Đi thẳng tới các màn hình làm việc thường dùng.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item) => (
            <QuickLinkCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Số liệu hệ thống</h2>
            <p className="text-sm text-muted-foreground">
              Tổng hợp theo từng module chính của hệ thống.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {formattedUpdatedAt && (
              <span className="text-sm text-muted-foreground">
                Cập nhật lúc {formattedUpdatedAt}
              </span>
            )}
            <Badge variant="outline" className="rounded-full border-border/70 px-3 py-1">
              {stats ? "Dữ liệu trực tiếp" : "Đang chờ tải dữ liệu"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadStats()}
              disabled={isLoading}
            >
              {isLoading ? "Đang tải..." : "Tải lại"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {isLoading && !stats ? (
            <>
              <DashboardStatSkeleton />
              <DashboardStatSkeleton />
              <DashboardStatSkeleton />
              <DashboardStatSkeleton />
            </>
          ) : stats ? (
            statGroups.map((config) => (
              <DashboardStatCard key={config.title} stats={stats} config={config} />
            ))
          ) : null}
        </div>
      </section>
    </div>
  )
}
