import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import {
  Drawer,
  DrawerContent,
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
  getPagedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "~/services/category.service";
import type { CategoryDto, PagedApiResponse } from "~/types/article";
import Pagination from "~/components/shared/Pagination";

export function meta() {
  return [{ title: "Danh mục nội dung | Hospital TTG" }];
}

// ── Schema ────────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = ["article", "album", "video"] as const;

const schema = z.object({
  name: z.string().min(1, "Bắt buộc").max(255),
  slug: z.string().min(1, "Bắt buộc").max(255),
  type: z.enum(TYPE_OPTIONS),
  lang: z.string().min(1).max(10),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  parentId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Category Form (dùng chung cho create & edit) ──────────────────────────────

function CategoryForm({
  formId,
  defaultValues,
  allCategories,
  excludeId,
  onSubmit,
}: {
  formId: string;
  defaultValues?: Partial<FormValues>;
  allCategories: CategoryDto[];
  excludeId?: string;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const available = allCategories.filter((c) => c.id !== excludeId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      type: "article",
      lang: "vi",
      sortOrder: 0,
      isActive: true,
      parentId: "",
      ...defaultValues,
    },
  });

  async function onFormSubmit(values: FormValues) {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    }
  }

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tên danh mục *</Label>
          <Input {...register("name")} placeholder="VD: Tin tức" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Slug *</Label>
          <Input {...register("slug")} placeholder="VD: tin-tuc" />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Loại *</Label>
          <select
            {...register("type")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="article">Bài viết</option>
            <option value="album">Album ảnh</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Ngôn ngữ</Label>
          <Input {...register("lang")} placeholder="vi" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Thứ tự</Label>
          <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label>Danh mục cha</Label>
          <select
            {...register("parentId")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Không có --</option>
            {available.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id={`${formId}-isActive`} {...register("isActive")} className="size-4" />
        <Label htmlFor={`${formId}-isActive`}>Kích hoạt</Label>
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  article: "Bài viết",
  album: "Album ảnh",
  video: "Video",
};

export default function ArticleCategoriesPage() {
  const [data, setData] = React.useState<PagedApiResponse<CategoryDto[]> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({ type: "", lang: "", page: 1, pageSize: 10 });
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<CategoryDto | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CategoryDto | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // track isSubmitting from child forms via ref callbacks
  const [createSubmitting, setCreateSubmitting] = React.useState(false);
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  const allCategories = React.useMemo(() => data?.data ?? [], [data]);

  async function loadData(f = filters) {
    setLoading(true);
    try {
      const res = await getPagedCategories(f);
      setData(res);
    } catch {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { loadData(); }, [filters]);

  function setFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  async function handleCreate(values: FormValues) {
    setCreateSubmitting(true);
    try {
      await createCategory({ ...values, parentId: values.parentId || null });
      toast.success("Tạo danh mục thành công");
      setCreateOpen(false);
      loadData();
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleUpdate(values: FormValues) {
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      await updateCategory(editTarget.id, { ...values, parentId: values.parentId || null });
      toast.success("Cập nhật danh mục thành công");
      setEditTarget(null);
      loadData();
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Xóa danh mục thành công");
      setDeleteTarget(null);
      loadData();
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
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Danh mục nội dung</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh mục cho bài viết, album và video</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <IconPlus className="size-4 mr-1" /> Thêm danh mục
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 pt-4 flex gap-3">
        <select
          value={filters.type}
          onChange={(e) => setFilter("type", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Tất cả loại</option>
          <option value="article">Bài viết</option>
          <option value="album">Album ảnh</option>
          <option value="video">Video</option>
        </select>
        <select
          value={filters.lang}
          onChange={(e) => setFilter("lang", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Tất cả ngôn ngữ</option>
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : !data?.data?.length ? (
          <p className="text-sm text-muted-foreground">Chưa có danh mục nào.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Loại</TableHead>
                  <TableHead className="text-center">Ngôn ngữ</TableHead>
                  <TableHead className="text-center">Thứ tự</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{TYPE_LABELS[cat.type] ?? cat.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{cat.lang}</TableCell>
                    <TableCell className="text-center">{cat.sortOrder}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cat.isActive ? "default" : "secondary"}>
                        {cat.isActive ? "Hoạt động" : "Ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditTarget(cat)}>
                          <IconEdit className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(cat)}>
                          <IconTrash className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              currentPage={data.pageNumber}
              totalPages={data.totalPages}
              onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </>
        )}
      </div>

      {/* Create Drawer */}
      <Drawer open={createOpen} onOpenChange={setCreateOpen} direction="right">
        <DrawerContent className="w-[480px]! max-w-[95vw]! flex flex-col">
          <DrawerHeader className="border-b px-6 py-4">
            <DrawerTitle>Thêm danh mục mới</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <CategoryForm
              formId="create-category-form"
              allCategories={allCategories}
              onSubmit={handleCreate}
            />
          </div>
          <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSubmitting}>
              Hủy
            </Button>
            <Button type="submit" form="create-category-form" disabled={createSubmitting}>
              {createSubmitting ? "Đang lưu..." : "Tạo mới"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }} direction="right">
        <DrawerContent className="w-[480px]! max-w-[95vw]! flex flex-col">
          <DrawerHeader className="border-b px-6 py-4">
            <DrawerTitle>Chỉnh sửa danh mục</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {editTarget && (
              <CategoryForm
                formId="edit-category-form"
                defaultValues={{
                  name: editTarget.name,
                  slug: editTarget.slug,
                  type: editTarget.type as "article" | "album" | "video",
                  lang: editTarget.lang,
                  sortOrder: editTarget.sortOrder,
                  isActive: editTarget.isActive,
                  parentId: editTarget.parentId ?? "",
                }}
                excludeId={editTarget.id}
                allCategories={allCategories}
                onSubmit={handleUpdate}
              />
            )}
          </div>
          <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editSubmitting}>
              Hủy
            </Button>
            <Button type="submit" form="edit-category-form" disabled={editSubmitting}>
              {editSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa danh mục{" "}
            <span className="font-medium text-foreground">"{deleteTarget?.name}"</span>?
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
