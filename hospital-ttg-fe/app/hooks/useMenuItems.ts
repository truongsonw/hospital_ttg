import * as React from "react"
import { useAuth } from "~/context/auth.context"
import { getMenusByRole } from "~/services/menu.service"
import type { MenuDto } from "~/types/system"

interface UseMenuItemsResult {
  menuItems: MenuDto[]
  loading: boolean
  error: string | null
}

export function useMenuItems(): UseMenuItemsResult {
  const { user } = useAuth()
  const [menuItems, setMenuItems] = React.useState<MenuDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user) {
      setMenuItems([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getMenusByRole(user.role)
      .then((items) => {
        if (!cancelled) setMenuItems(items)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải danh sách menu")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.role])

  return { menuItems, loading, error }
}
