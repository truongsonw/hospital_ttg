import * as React from "react"
import { toast } from "sonner"
import { Shield, CheckSquare, Square, KeyRound } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { ApiError } from "~/lib/api"
import {
  assignPermissionsToRole,
  getAllRolePermissions,
  getRolePermissions,
  getRoles,
} from "~/services/user.service"
import {
  getAllMenus,
  getMenusByRole,
  assignMenusToRole,
} from "~/services/menu.service"
import type { RoleDto, MenuDto } from "~/types/system"
import type { RolePermissionDto } from "~/types/auth"

export function meta() {
  return [{ title: "Vai trò | Hospital TTG" }]
}

interface FlatMenuItem {
  id: string
  title: string
  depth: number
}

function flattenMenuTree(nodes: MenuDto[], depth = 0): FlatMenuItem[] {
  const result: FlatMenuItem[] = []
  for (const node of nodes) {
    result.push({ id: node.id, title: node.title, depth })
    if (node.children?.length) {
      result.push(...flattenMenuTree(node.children, depth + 1))
    }
  }
  return result
}

function extractMenuIds(nodes: MenuDto[]): string[] {
  return flattenMenuTree(nodes).map((menu) => menu.id)
}

function AssignMenuDialog({
  role,
  open,
  onOpenChange,
  onAssigned,
}: {
  role: RoleDto | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onAssigned: () => void
}) {
  const [allMenus, setAllMenus] = React.useState<MenuDto[]>([])
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open || !role) return
    setLoading(true)
    setServerError(null)

    Promise.all([getAllMenus(0), getMenusByRole(role.id)])
      .then(([menus, roleMenus]) => {
        const selectedMenuIds = extractMenuIds(roleMenus)
        setAllMenus(menus)
        setSelectedIds(new Set(selectedMenuIds))
      })
      .catch(() => setServerError("Không thể tải danh sách menu."))
      .finally(() => setLoading(false))
  }, [open, role])

  function toggleMenu(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      const allIds = new Set(flattenMenuTree(allMenus).map((m) => m.id))
      setSelectedIds(allIds)
    } else {
      setSelectedIds(new Set())
    }
  }

  async function handleSubmit() {
    if (!role) return
    setSaving(true)
    setServerError(null)
    try {
      const selectedMenuIds = Array.from(selectedIds)
      await assignMenusToRole({ roleId: role.id, menuIds: selectedMenuIds })
      setSelectedIds(new Set(selectedMenuIds))
      toast.success("Gán menu cho vai trò thành công.")
      onOpenChange(false)
      onAssigned()
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Không thể gán menu.")
    } finally {
      setSaving(false)
    }
  }

  const flatMenus = React.useMemo(() => flattenMenuTree(allMenus), [allMenus])
  const allIds = React.useMemo(() => new Set(flatMenus.map((m) => m.id)), [flatMenus])
  const allSelected = allIds.size > 0 && Array.from(allIds).every((id) => selectedIds.has(id))
  const someSelected = !allSelected && Array.from(allIds).some((id) => selectedIds.has(id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gán menu cho vai trò</DialogTitle>
          <DialogDescription>
            Chọn các menu mà vai trò{" "}
            <span className="font-medium text-foreground">{role?.name}</span> được phép truy cập.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : serverError && !allMenus.length ? (
          <div className="py-4 text-sm text-destructive">{serverError}</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto border rounded-md">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 sticky top-0 z-10">
              <button
                type="button"
                onClick={() => toggleAll(!allSelected)}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                {someSelected || allSelected ? (
                  <CheckSquare className="size-4 text-primary" />
                ) : (
                  <Square className="size-4 text-muted-foreground" />
                )}
                Chọn tất cả
              </button>
            </div>

            <div className="divide-y">
              {flatMenus.map((menu) => (
                <label
                  key={menu.id}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/30 transition-colors"
                  style={{ paddingLeft: `${menu.depth * 20 + 12}px` }}
                >
                  <Checkbox
                    checked={selectedIds.has(menu.id)}
                    onCheckedChange={() => toggleMenu(menu.id)}
                  />
                  <span className="text-sm">{menu.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {serverError && allMenus.length > 0 && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={saving || loading}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AssignPermissionDialog({
  role,
  open,
  onOpenChange,
  onAssigned,
}: {
  role: RoleDto | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onAssigned: () => void
}) {
  const [allPermissions, setAllPermissions] = React.useState<RolePermissionDto[]>([])
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set())
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open || !role) return
    setLoading(true)
    setServerError(null)

    Promise.all([getAllRolePermissions(), getRolePermissions(role.id)])
      .then(([permissions, assigned]) => {
        setAllPermissions(permissions)
        setSelectedKeys(new Set(assigned.permissions))
      })
      .catch(() => setServerError("Không thể tải danh sách quyền."))
      .finally(() => setLoading(false))
  }, [open, role])

  function togglePermission(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      setSelectedKeys(new Set(allPermissions.map((permission) => permission.key)))
    } else {
      setSelectedKeys(new Set())
    }
  }

  async function handleSubmit() {
    if (!role) return
    setSaving(true)
    setServerError(null)
    try {
      const permissions = Array.from(selectedKeys)
      await assignPermissionsToRole(role.id, { roleId: role.id, permissions })
      setSelectedKeys(new Set(permissions))
      toast.success("Gán quyền cho vai trò thành công.")
      onOpenChange(false)
      onAssigned()
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Không thể gán quyền.")
    } finally {
      setSaving(false)
    }
  }

  const allSelected = allPermissions.length > 0 && allPermissions.every((permission) => selectedKeys.has(permission.key))
  const someSelected = !allSelected && allPermissions.some((permission) => selectedKeys.has(permission.key))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gán quyền cho vai trò</DialogTitle>
          <DialogDescription>
            Chọn các quyền nghiệp vụ mà vai trò{" "}
            <span className="font-medium text-foreground">{role?.name}</span> được phép sử dụng.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : serverError && !allPermissions.length ? (
          <div className="py-4 text-sm text-destructive">{serverError}</div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto border rounded-md">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 sticky top-0 z-10">
              <button
                type="button"
                onClick={() => toggleAll(!allSelected)}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                {someSelected || allSelected ? (
                  <CheckSquare className="size-4 text-primary" />
                ) : (
                  <Square className="size-4 text-muted-foreground" />
                )}
                Chọn tất cả
              </button>
            </div>

            <div className="divide-y">
              {allPermissions.map((permission) => (
                <label
                  key={permission.key}
                  className="flex cursor-pointer items-start gap-3 px-3 py-3 hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={selectedKeys.has(permission.key)}
                    onCheckedChange={() => togglePermission(permission.key)}
                  />
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{permission.description}</div>
                    <div className="text-xs text-muted-foreground font-mono">{permission.key}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {serverError && allPermissions.length > 0 && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={saving || loading}>
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function RolesPage() {
  const [roles, setRoles] = React.useState<RoleDto[]>([])
  const [menuCounts, setMenuCounts] = React.useState<Record<string, number>>({})
  const [permissionCounts, setPermissionCounts] = React.useState<Record<string, number>>({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [assignMenuTarget, setAssignMenuTarget] = React.useState<RoleDto | null>(null)
  const [assignPermissionTarget, setAssignPermissionTarget] = React.useState<RoleDto | null>(null)

  async function loadRoles() {
    setLoading(true)
    setError(null)
    try {
      const data = await getRoles()
      setRoles(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể tải danh sách vai trò.")
    } finally {
      setLoading(false)
    }
  }

  async function loadMenuCounts(roleList: RoleDto[]) {
    const counts: Record<string, number> = {}
    await Promise.all(
      roleList.map(async (role) => {
        try {
          const menus = await getMenusByRole(role.id)
          counts[role.id] = extractMenuIds(menus).length
        } catch {
          counts[role.id] = 0
        }
      })
    )
    setMenuCounts(counts)
  }

  async function loadPermissionCounts(roleList: RoleDto[]) {
    const counts: Record<string, number> = {}
    await Promise.all(
      roleList.map(async (role) => {
        try {
          const assigned = await getRolePermissions(role.id)
          counts[role.id] = assigned.permissions.length
        } catch {
          counts[role.id] = 0
        }
      })
    )
    setPermissionCounts(counts)
  }

  React.useEffect(() => {
    loadRoles()
  }, [])

  React.useEffect(() => {
    if (roles.length > 0) {
      void loadMenuCounts(roles)
      void loadPermissionCounts(roles)
    } else {
      setMenuCounts({})
      setPermissionCounts({})
    }
  }, [roles])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vai trò</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý vai trò, menu truy cập và quyền nghiệp vụ cho từng vai trò.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên vai trò</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="text-center">Số menu</TableHead>
              <TableHead className="text-center">Số quyền</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chưa có vai trò nào.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-muted-foreground" />
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{menuCounts[role.id] ?? "—"} menu</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{permissionCounts[role.id] ?? "—"} quyền</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={role.isActive ? "default" : "destructive"}>
                      {role.isActive ? "Hoạt động" : "Tắt"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssignMenuTarget(role)}
                      >
                        Gán menu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAssignPermissionTarget(role)}
                      >
                        <KeyRound className="mr-2 size-4" />
                        Gán quyền
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AssignMenuDialog
        role={assignMenuTarget}
        open={!!assignMenuTarget}
        onOpenChange={(v) => !v && setAssignMenuTarget(null)}
        onAssigned={() => {
          if (assignMenuTarget) {
            void getMenusByRole(assignMenuTarget.id).then((menus) =>
              setMenuCounts((prev) => ({ ...prev, [assignMenuTarget.id]: extractMenuIds(menus).length }))
            )
          }
        }}
      />

      <AssignPermissionDialog
        role={assignPermissionTarget}
        open={!!assignPermissionTarget}
        onOpenChange={(v) => !v && setAssignPermissionTarget(null)}
        onAssigned={() => {
          if (assignPermissionTarget) {
            void getRolePermissions(assignPermissionTarget.id).then((assigned) =>
              setPermissionCounts((prev) => ({ ...prev, [assignPermissionTarget.id]: assigned.permissions.length }))
            )
          }
        }}
      />
    </div>
  )
}
