import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Route } from "./+types/system.categories";
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
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "~/services/syscategory.service";
import type { SysCategoryDto } from "~/types/system";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Danh mục hệ thống | Hospital TTG" }];
}

// ── Schema ────────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  code: z.string().max(100),
  name: z.string().max(500),
  type: z.number().int(),
  description: z.string().max(1000),
  active: z.boolean(),
  parentId: z.string(),
  ext1s: z.string().max(1000),
  ext1d: z.string(),
});

type CategoryValues = z.infer<typeof categorySchema>;

// ── Category Form (shared for create & edit) ──────────────────────────────────

function CategoryForm({
  defaultValues,
  categories,
  excludeId,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  defaultValues?: Partial<CategoryValues>;
  categories: SysCategoryDto[];
  excludeId?: string;
  onSubmit: (values: CategoryValues) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const available = categories.filter((c) => c.id !== excludeId && !c.deleted);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { code: "", name: "", type: 0, description: "", active: true, parentId: "", ext1s: "", ext1d: "", ...defaultValues },
  });

  async function handleFormSubmit(values: CategoryValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    }
  }

  return (
    <form className="space-y-4 pt-2" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mã code</Label>
          <Input {...register("code")} placeholder="VD: NEWS" />
        </div>
        <div className="space-y-2">
          <Label>Loại (Type) *</Label>
          <Input type="number" {...register("type")} />
          {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Tên danh mục</Label>
        <Input {...register("name")} placeholder="VD: Danh mục tin tức" />
      </div>
      <div className="space-y-2">
        <Label>Mô tả</Label>
        <Input {...register("description")} />
      </div>
      <div className="space-y-2">
        <Label>Danh mục cha</Label>
        <select
          {...register("parentId")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">-- Không có --</option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name ?? c.code ?? c.id}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ext1s</Label>
          <Input {...register("ext1s")} />
        </div>
        <div className="space-y-2">
          <Label>Ext1d</Label>
          <Input type="number" step="any" {...register("ext1d")} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="catActive" {...register("active")} className="size-4" />
        <Label htmlFor="catActive">Kích hoạt</Label>
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Hủy</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : submitLabel}</Button>
      </div>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SystemCategoriesPage() {
  const [categories, setCategories] = React.useState<SysCategoryDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<SysCategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<SysCategoryDto | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const visible = React.useMemo(
    () => categories.filter((c) => !c.deleted),
    [categories],
  );

  async function loadCategories() {
    setLoading(true);
    try {
      setCategories(await getAllCategories());
    } catch {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { loadCategories(); }, []);

  async function handleCreate(values: CategoryValues) {
    await createCategory({
      code: values.code || null,
      name: values.name || null,
      type: values.type,
      description: values.description || null,
      active: values.active,
      parentId: values.parentId || null,
      ext1s: values.ext1s || null,
      ext1d: values.ext1d !== "" ? parseFloat(values.ext1d) : null,
    });
    toast.success("Tạo danh mục thành công");
    setCreateOpen(false);
    loadCategories();
  }

  async function handleUpdate(values: CategoryValues) {
    if (!editTarget) return;
    await updateCategory(editTarget.id, {
      code: values.code || null,
      name: values.name || null,
      type: values.type,
      description: values.description || null,
      active: values.active,
      parentId: values.parentId || null,
      ext1s: values.ext1s || null,
      ext1d: values.ext1d !== "" ? parseFloat(values.ext1d) : null,
    });
    toast.success("Cập nhật danh mục thành công");
    setEditTarget(null);
    loadCategories();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Xóa danh mục thành công");
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      <div className="p-6 border-b dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Danh mục hệ thống</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các danh mục dùng chung trong hệ thống</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-1" /> Thêm danh mục
        </Button>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có danh mục nào.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã code</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead className="text-center">Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-mono text-sm">{cat.code ?? "—"}</TableCell>
                  <TableCell>{cat.name ?? "—"}</TableCell>
                  <TableCell className="text-center">{cat.type}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{cat.description ?? "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={cat.active !== false ? "default" : "secondary"}>
                      {cat.active !== false ? "Hoạt động" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditTarget(cat)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(cat)}>
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
          </DialogHeader>
          <CategoryForm
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            submitLabel="Tạo mới"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            </DialogHeader>
            <CategoryForm
              defaultValues={{
                code: editTarget.code ?? "",
                name: editTarget.name ?? "",
                type: editTarget.type,
                description: editTarget.description ?? "",
                active: editTarget.active !== false,
                parentId: editTarget.parentId ?? "",
                ext1s: editTarget.ext1s ?? "",
                ext1d: editTarget.ext1d != null ? String(editTarget.ext1d) : "",
              }}
              excludeId={editTarget.id}
              categories={categories}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
              submitLabel="Lưu"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa danh mục{" "}
            <span className="font-medium text-foreground">"{deleteTarget?.name ?? deleteTarget?.code}"</span>?
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

