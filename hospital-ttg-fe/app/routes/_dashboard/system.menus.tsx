import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Edit, Trash2, Plus, ChevronRight } from "lucide-react";
import type { Route } from "./+types/system.menus";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
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

// ── Flatten tree to list with depth info ────────────────────────────────────

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

// ── Create Dialog ────────────────────────────────────────────────────────────

function CreateMenuDialog({
  menus,
  onCreated,
}: {
  menus: MenuDto[];
  onCreated: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const flat = React.useMemo(() => flattenTree(menus), [menus]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: "", url: "", icon: "", sortOrder: 0, isActive: true, parentId: "" },
  });

  async function onSubmit(values: CreateValues) {
    setServerError(null);
    try {
      await createMenu({
        title: values.title,
        url: values.url || null,
        icon: values.icon || null,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
        parentId: values.parentId || null,
        type: MenuType.Admin,
      });
      toast.success("Tạo menu thành công");
      setOpen(false);
      reset();
      onCreated();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setServerError(null); } }}>
      <Button onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-1" /> Thêm menu
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm menu mới</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Tiêu đề *</Label>
            <Input {...register("title")} placeholder="VD: Quản lý người dùng" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input {...register("url")} placeholder="/dashboard/users" />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Input {...register("icon")} placeholder="IconUsers" />
          </div>
          <div className="space-y-2">
            <Label>Menu cha</Label>
            <select
              {...register("parentId")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Không có --</option>
              {flat.map((m) => (
                <option key={m.id} value={m.id}>
                  {"　".repeat(m.depth)}{m.depth > 0 ? "└ " : ""}{m.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thứ tự</Label>
              <Input type="number" defaultValue={0} {...register("sortOrder")} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isActive" defaultChecked {...register("isActive")} className="size-4" />
              <Label htmlFor="isActive">Kích hoạt</Label>
            </div>
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Tạo mới"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Dialog ───────────────────────────────────────────────────────────────

function EditMenuDialog({
  menu,
  menus,
  onUpdated,
  open,
  onOpenChange,
}: {
  menu: MenuDto;
  menus: MenuDto[];
  onUpdated: () => void;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const flat = React.useMemo(
    () => flattenTree(menus).filter((m) => m.id !== menu.id),
    [menus, menu.id],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: menu.title,
      url: menu.url ?? "",
      icon: menu.icon ?? "",
      sortOrder: menu.sortOrder,
      isActive: menu.isActive,
      isExternal: false,
      parentId: menu.parentId ?? "",
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        title: menu.title,
        url: menu.url ?? "",
        icon: menu.icon ?? "",
        sortOrder: menu.sortOrder,
        isActive: menu.isActive,
        isExternal: false,
        parentId: menu.parentId ?? "",
      });
      setServerError(null);
    }
  }, [open, menu, reset]);

  async function onSubmit(values: UpdateValues) {
    setServerError(null);
    try {
      await updateMenu(menu.id, {
        title: values.title,
        url: values.url || null,
        icon: values.icon || null,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
        isExternal: values.isExternal,
        parentMenuId: values.parentId || null,
      });
      toast.success("Cập nhật menu thành công");
      onOpenChange(false);
      onUpdated();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa menu</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label>Tiêu đề *</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input {...register("url")} />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Input {...register("icon")} />
          </div>
          <div className="space-y-2">
            <Label>Menu cha</Label>
            <select
              {...register("parentId")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">-- Không có --</option>
              {flat.map((m) => (
                <option key={m.id} value={m.id}>
                  {"　".repeat(m.depth)}{m.depth > 0 ? "└ " : ""}{m.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thứ tự</Label>
              <Input type="number" {...register("sortOrder")} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="editIsActive" {...register("isActive")} className="size-4" />
                <Label htmlFor="editIsActive">Kích hoạt</Label>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isExternal" {...register("isExternal")} className="size-4" />
            <Label htmlFor="isExternal">Liên kết ngoài</Label>
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function DeleteConfirmDialog({
  menu,
  open,
  onOpenChange,
  onDeleted,
}: {
  menu: MenuDto | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  async function handleDelete() {
    if (!menu) return;
    setLoading(true);
    setServerError(null);
    try {
      await deleteMenu(menu.id);
      toast.success("Xóa menu thành công");
      onOpenChange(false);
      onDeleted();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setServerError(null); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bạn có chắc muốn xóa menu <span className="font-medium text-foreground">"{menu?.title}"</span>?
        </p>
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SystemMenusPage() {
  const [menus, setMenus] = React.useState<MenuDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editTarget, setEditTarget] = React.useState<MenuDto | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<MenuDto | null>(null);

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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      <div className="p-6 border-b dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Quản lý Menu</h2>
          <p className="text-sm text-gray-500 mt-1">Cấu hình menu điều hướng hệ thống</p>
        </div>
        <CreateMenuDialog menus={menus} onCreated={loadMenus} />
      </div>

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
                  <TableCell className="text-muted-foreground text-sm">{menu.icon ?? "—"}</TableCell>
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

      {editTarget && (
        <EditMenuDialog
          menu={editTarget}
          menus={menus}
          onUpdated={loadMenus}
          open={!!editTarget}
          onOpenChange={(v) => { if (!v) setEditTarget(null); }}
        />
      )}

      <DeleteConfirmDialog
        menu={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        onDeleted={loadMenus}
      />
    </div>
  );
}
