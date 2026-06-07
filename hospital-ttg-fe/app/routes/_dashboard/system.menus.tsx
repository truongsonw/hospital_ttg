import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Edit, Trash2, Plus, ChevronRight } from "lucide-react";
import { SUPPORTED_MENU_ICONS, getMenuIcon } from "~/lib/menu-icons";
import type { Route } from "./+types/system.menus";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "~/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ApiError } from "~/lib/api";
import {
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from "~/services/menu.service";
import { MenuType, type MenuDto } from "~/types/system";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Quản lý Menu | Hospital TTG" }];
}

// ── Zod schemas ─────────────────────────────────────────────────────────────

const createSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  url: z.string().max(500),
  icon: z.string().max(100),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  parentId: z.string(),
});

const updateSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200),
  url: z.string().max(500),
  icon: z.string().max(100),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  isExternal: z.boolean(),
  parentId: z.string(),
});

type CreateValues = z.infer<typeof createSchema>;
type UpdateValues = z.infer<typeof updateSchema>;

// ── Flatten tree ────────────────────────────────────────────────────────────

interface FlatMenu extends MenuDto {
  depth: number;
}

function flattenTree(nodes: MenuDto[], depth = 0): FlatMenu[] {
  const result: FlatMenu[] = [];
  for (const node of nodes) {
    result.push({ ...node, depth });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

// ── Icon Picker ─────────────────────────────────────────────────────────────

function IconPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = React.useState("");

  const filteredIcons = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return SUPPORTED_MENU_ICONS.slice(0, 240);
    return SUPPORTED_MENU_ICONS.filter((iconName) => iconName.toLowerCase().includes(normalized)).slice(0, 240);
  }, [query]);

  return (
    <div className="space-y-3">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm icon, ví dụ: user, menu, setting..."
      />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Đang chọn:</span>
        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1">
          {(() => {
            const Icon = getMenuIcon(value);
            return <Icon className="size-4" />;
          })()}
          <span>{value || "Mặc định"}</span>
        </span>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md border p-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onChange("")}
            className={`flex items-center gap-2 rounded-md border px-2 py-2 text-left text-sm transition hover:bg-muted ${!value ? "border-primary bg-primary/5" : "border-border"}`}
          >
            {(() => {
              const Icon = getMenuIcon("");
              return <Icon className="size-4 shrink-0" />;
            })()}
            <span className="truncate">Mặc định</span>
          </button>
          {filteredIcons.map((iconName) => {
            const Icon = getMenuIcon(iconName);
            const selected = value === iconName;
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onChange(iconName)}
                className={`flex items-center gap-2 rounded-md border px-2 py-2 text-left text-sm transition hover:bg-muted ${selected ? "border-primary bg-primary/5" : "border-border"}`}
                title={iconName}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{iconName}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Hiển thị tối đa 240 icon theo bộ lọc. Gõ để tìm icon cụ thể.
      </p>
    </div>
  );
}

// ── Menu Form (dùng chung cho create & edit) ─────────────────────────────────

function MenuForm({
  formId,
  defaultValues,
  allMenus,
  excludeId,
  onSubmit,
}: {
  formId: string;
  defaultValues?: Partial<CreateValues & UpdateValues>;
  allMenus: MenuDto[];
  excludeId?: string;
  onSubmit: (values: CreateValues | UpdateValues) => Promise<void>;
  submitLabel: string;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const flat = React.useMemo(() => flattenTree(allMenus), [allMenus]);
  const available = React.useMemo(
    () => flat.filter((m) => m.id !== excludeId),
    [flat, excludeId],
  );

  const schema = formId === "create-menu-form" ? createSchema : updateSchema;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues | UpdateValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      url: "",
      icon: "",
      sortOrder: 0,
      isActive: true,
      isExternal: false,
      parentId: "",
      ...defaultValues,
    } as CreateValues | UpdateValues,
  });

  const selectedIcon = watch("icon");

  React.useEffect(() => {
    if (defaultValues) {
      reset(defaultValues as CreateValues | UpdateValues);
    }
  }, [defaultValues, reset]);

  async function onFormSubmit(values: CreateValues | UpdateValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    }
  }

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
      <div className="space-y-2">
        <Label>Tiêu đề *</Label>
        <Input {...register("title")} placeholder="VD: Quản lý người dùng" />
        {errors.title && <p className="text-sm text-destructive">{String(errors.title?.message)}</p>}
      </div>

      <div className="space-y-2">
        <Label>URL</Label>
        <Input {...register("url")} placeholder="/dashboard/users" />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <IconPicker value={selectedIcon} onChange={(value) => setValue("icon", value, { shouldDirty: true })} />
      </div>

      <div className="space-y-2">
        <Label>Menu cha</Label>
        <select
          {...register("parentId")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">-- Không có --</option>
          {available.map((m) => (
            <option key={m.id} value={m.id}>
              {"　".repeat(m.depth)}{m.depth > 0 ? "└ " : ""}{m.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Thứ tự</Label>
          <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id={`${formId}-isActive`} {...register("isActive")} className="size-4" />
          <Label htmlFor={`${formId}-isActive`}>Kích hoạt</Label>
        </div>
      </div>

      {formId === "edit-menu-form" && (
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`${formId}-isExternal`} {...register("isExternal")} className="size-4" />
          <Label htmlFor={`${formId}-isExternal`}>Liên kết ngoài</Label>
        </div>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SystemMenusPage() {
  const [menus, setMenus] = React.useState<MenuDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<MenuDto | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MenuDto | null>(null);
  const [createSubmitting, setCreateSubmitting] = React.useState(false);
  const [editSubmitting, setEditSubmitting] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const flat = React.useMemo(() => flattenTree(menus), [menus]);

  async function loadMenus() {
    setLoading(true);
    try {
      setMenus(await getAllMenus(MenuType.Admin));
    } catch {
      toast.error("Không thể tải danh sách menu");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { loadMenus(); }, []);

  async function handleCreate(values: CreateValues | UpdateValues) {
    const v = values as CreateValues;
    setCreateSubmitting(true);
    try {
      await createMenu({
        title: v.title,
        url: v.url || null,
        icon: v.icon || null,
        sortOrder: v.sortOrder,
        isActive: v.isActive,
        parentId: v.parentId || null,
        type: MenuType.Admin,
      });
      toast.success("Tạo menu thành công");
      setCreateOpen(false);
      loadMenus();
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleUpdate(values: CreateValues | UpdateValues) {
    if (!editTarget) return;
    const v = values as UpdateValues;
    setEditSubmitting(true);
    try {
      await updateMenu(editTarget.id, {
        title: v.title,
        url: v.url || null,
        icon: v.icon || null,
        sortOrder: v.sortOrder,
        isActive: v.isActive,
        isExternal: v.isExternal,
        parentMenuId: v.parentId || null,
        type: editTarget.type,
      });
      toast.success("Cập nhật menu thành công");
      setEditTarget(null);
      loadMenus();
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMenu(deleteTarget.id);
      toast.success("Xóa menu thành công");
      setDeleteTarget(null);
      loadMenus();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Quản lý Menu</h2>
          <p className="text-sm text-gray-500 mt-1">Cấu hình menu điều hướng hệ thống</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-1" /> Thêm menu
        </Button>
      </div>

      {/* Table */}
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : flat.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có menu nào.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-center">Thứ tự</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flat.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell>
                    <span style={{ paddingLeft: `${menu.depth * 20}px` }} className="flex items-center gap-1">
                      {menu.depth > 0 && <ChevronRight className="size-3 text-muted-foreground" />}
                      {menu.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{menu.url ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <span className="inline-flex items-center gap-2">
                      {(() => {
                        const Icon = getMenuIcon(menu.icon);
                        return <Icon className="size-4" />;
                      })()}
                      <span>{menu.icon ?? "—"}</span>
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{menu.sortOrder}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={menu.isActive ? "default" : "secondary"}>
                      {menu.isActive ? "Hoạt động" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditTarget(menu)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(menu)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Drawer */}
      <Drawer open={createOpen} onOpenChange={setCreateOpen} className="w-[520px] max-w-[95vw]">
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle>Thêm menu mới</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <MenuForm
            formId="create-menu-form"
            allMenus={menus}
            onSubmit={handleCreate}
            submitLabel="Tạo mới"
          />
        </div>
        <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="create-menu-form" disabled={createSubmitting}>
            {createSubmitting ? "Đang lưu..." : "Tạo mới"}
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        open={!!editTarget}
        onOpenChange={(v) => { if (!v) setEditTarget(null); }}
        className="w-[520px] max-w-[95vw]"
      >
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle>Chỉnh sửa menu</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {editTarget && (
            <MenuForm
              formId="edit-menu-form"
              defaultValues={{
                title: editTarget.title,
                url: editTarget.url ?? "",
                icon: editTarget.icon ?? "",
                sortOrder: editTarget.sortOrder,
                isActive: editTarget.isActive,
                isExternal: false,
                parentId: editTarget.parentId ?? "",
              }}
              allMenus={menus}
              excludeId={editTarget.id}
              onSubmit={handleUpdate}
              submitLabel="Lưu"
            />
          )}
        </div>
        <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="edit-menu-form" disabled={editSubmitting}>
            {editSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa menu <span className="font-medium text-foreground">"{deleteTarget?.title}"</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
