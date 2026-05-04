import * as React from "react";
import { Link } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Flame, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
import { getAllCategoriesList } from "~/services/category.service";
import { getPagedContents, createContent, updateContent, deleteContent, getContentById } from "~/services/content.service";
import type { CategoryDto, ContentDto, PagedApiResponse } from "~/types/article";
import Pagination from "~/components/shared/Pagination";
import TiptapEditor from "~/components/shared/TiptapEditor";
import FileUploadInput from "~/components/shared/FileUploadInput";

export function meta() {
  return [{ title: "Quản lý nội dung | Hospital TTG" }];
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, "Bắt buộc").max(500),
  slug: z.string().min(1, "Bắt buộc").max(500),
  contentType: z.enum(["article", "album", "video", "service"]),
  categoryId: z.string().min(1, "Bắt buộc"),
  status: z.number().int().min(0).max(1),
  isHot: z.boolean(),
  intro: z.string().optional(),
  body: z.string().optional(),
  thumbnail: z.string().optional(),
  fileAttach: z.string().optional(),
  tags: z.string().optional(),
  publishedAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const DEFAULT_VALUES: FormValues = {
  title: "",
  slug: "",
  contentType: "article",
  categoryId: "",
  status: 1,
  isHot: false,
  intro: "",
  body: "",
  thumbnail: "",
  fileAttach: "",
  tags: "",
  publishedAt: "",
};

// ── Shared form body ──────────────────────────────────────────────────────────

function ContentFormFields({
  formId,
  register,
  control,
  errors,
  categories,
  serverError,
  onSubmit,
}: {
  formId: string;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  control: ReturnType<typeof useForm<FormValues>>["control"];
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
  categories: CategoryDto[];
  serverError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
    >
      {/* Tiêu đề & Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tiêu đề *</Label>
          <Input {...register("title")} placeholder="VD: Tin tức sức khỏe mới nhất" />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Slug *</Label>
          <Input {...register("slug")} placeholder="VD: tin-tuc-suc-khoe-moi-nhat" />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      {/* Loại & Danh mục */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Loại nội dung *</Label>
          <select
            {...register("contentType")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="article">Bài viết</option>
            <option value="album">Album ảnh</option>
            <option value="video">Video</option>
            <option value="service">Dịch vụ y khoa</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Danh mục *</Label>
          <select
            {...register("categoryId")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
        </div>
      </div>

      {/* Thumbnail & File đính kèm */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Thumbnail</Label>
          <Controller
            name="thumbnail"
            control={control}
            render={({ field }) => (
              <FileUploadInput
                value={field.value ?? ""}
                onChange={field.onChange}
                accept="image/*"
                label="ảnh thumbnail"
              />
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>File đính kèm</Label>
          <Controller
            name="fileAttach"
            control={control}
            render={({ field }) => (
              <FileUploadInput
                value={field.value ?? ""}
                onChange={field.onChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                label="file đính kèm"
              />
            )}
          />
        </div>
      </div>

      {/* Tags & Ngày xuất bản */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tags</Label>
          <Input {...register("tags")} placeholder="sức khỏe, y tế, ..." />
        </div>
        <div className="space-y-1.5">
          <Label>Ngày xuất bản</Label>
          <Input type="datetime-local" {...register("publishedAt")} />
        </div>
      </div>

      {/* Trạng thái & Hot */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Trạng thái</Label>
          <select
            {...register("status", { valueAsNumber: true })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value={1}>Hiển thị</option>
            <option value={0}>Ẩn</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" id={`${formId}-isHot`} {...register("isHot")} className="size-4" />
          <Label htmlFor={`${formId}-isHot`}>Nội dung nổi bật (Hot)</Label>
        </div>
      </div>

      {/* Giới thiệu */}
      <div className="space-y-1.5">
        <Label>Giới thiệu</Label>
        <textarea
          {...register("intro")}
          rows={3}
          placeholder="Mô tả ngắn hiển thị ở trang danh sách..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
        />
      </div>

      {/* Nội dung chính */}
      <div className="space-y-1.5">
        <Label>Nội dung chính</Label>
        <Controller
          name="body"
          control={control}
          render={({ field }) => (
            <TiptapEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Nhập nội dung bài viết..."
              minHeight={300}
            />
          )}
        />
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
    </form>
  );
}

// ── Create Drawer ─────────────────────────────────────────────────────────────

function CreateDrawer({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: CategoryDto[];
  onSuccess: () => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });

  function handleClose() {
    reset();
    setServerError(null);
    onOpenChange(false);
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await createContent({
        ...values,
        intro: values.intro || null,
        body: values.body || null,
        thumbnail: values.thumbnail || null,
        fileAttach: values.fileAttach || null,
        tags: values.tags || null,
        publishedAt: values.publishedAt || null,
      });
      toast.success("Tạo nội dung thành công");
      handleClose();
      onSuccess();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-[720px] max-w-[95vw]">
      <DrawerHeader className="border-b px-6 py-4">
        <DrawerTitle>Thêm nội dung mới</DrawerTitle>
      </DrawerHeader>

      <ContentFormFields
        formId="create-content-form"
        register={register}
        control={control}
        errors={errors}
        categories={categories}
        serverError={serverError}
        onSubmit={handleSubmit(onSubmit)}
      />

      <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" form="create-content-form" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : "Tạo nội dung"}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────

function EditDrawer({
  contentId,
  open,
  onOpenChange,
  categories,
  onSuccess,
}: {
  contentId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: CategoryDto[];
  onSuccess: () => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [loadingContent, setLoadingContent] = React.useState(false);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: DEFAULT_VALUES });

  React.useEffect(() => {
    if (!contentId || !open) return;
    setLoadingContent(true);
    setServerError(null);
    getContentById(contentId)
      .then((content) => {
        reset({
          title: content.title,
          slug: content.slug,
          contentType: content.contentType as "article" | "album" | "video" | "service",
          categoryId: content.categoryId,
          status: content.status,
          isHot: content.isHot,
          intro: content.intro ?? "",
          body: content.body ?? "",
          thumbnail: content.thumbnail ?? "",
          fileAttach: content.fileAttach ?? "",
          tags: content.tags ?? "",
          publishedAt: content.publishedAt
            ? new Date(content.publishedAt).toISOString().slice(0, 16)
            : "",
        });
      })
      .catch(() => toast.error("Không thể tải dữ liệu nội dung"))
      .finally(() => setLoadingContent(false));
  }, [contentId, open]);

  function handleClose() {
    reset(DEFAULT_VALUES);
    setServerError(null);
    onOpenChange(false);
  }

  async function onSubmit(values: FormValues) {
    if (!contentId) return;
    setServerError(null);
    try {
      await updateContent(contentId, {
        ...values,
        intro: values.intro || null,
        body: values.body || null,
        thumbnail: values.thumbnail || null,
        fileAttach: values.fileAttach || null,
        tags: values.tags || null,
        publishedAt: values.publishedAt || null,
      });
      toast.success("Cập nhật nội dung thành công");
      handleClose();
      onSuccess();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra");
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-[720px] max-w-[95vw]">
      <DrawerHeader className="border-b px-6 py-4">
        <DrawerTitle>Chỉnh sửa nội dung</DrawerTitle>
      </DrawerHeader>

      {loadingContent ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      ) : (
        <ContentFormFields
          formId="edit-content-form"
          register={register}
          control={control}
          errors={errors}
          categories={categories}
          serverError={serverError}
          onSubmit={handleSubmit(onSubmit)}
        />
      )}

      <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting || loadingContent}>
          Hủy
        </Button>
        <Button type="submit" form="edit-content-form" disabled={isSubmitting || loadingContent}>
          {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  article: "Bài viết",
  album: "Album",
  video: "Video",
  service: "Dịch vụ y khoa",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

export default function ArticleContentsPage() {
  const [data, setData] = React.useState<PagedApiResponse<ContentDto[]> | null>(null);
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({ type: "", categoryId: "", status: "", page: 1, pageSize: 10 });
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ContentDto | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const categoryMap = React.useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  async function loadData(f = filters) {
    setLoading(true);
    try {
      const res = await getPagedContents(f);
      setData(res);
    } catch {
      toast.error("Không thể tải danh sách nội dung");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    getAllCategoriesList().then(setCategories).catch(() => {});
    loadData();
  }, []);

  React.useEffect(() => { loadData(); }, [filters]);

  function setFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function openEdit(id: string) {
    setEditTarget(id);
    setEditOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteContent(deleteTarget.id);
      toast.success("Xóa nội dung thành công");
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
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Quản lý nội dung</h2>
          <p className="text-sm text-gray-500 mt-1">Bài viết, album ảnh và video</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-1" /> Thêm nội dung
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 pt-4 flex gap-3 flex-wrap">
        <select
          value={filters.type}
          onChange={(e) => setFilter("type", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Tất cả loại</option>
          <option value="article">Bài viết</option>
          <option value="album">Album ảnh</option>
          <option value="video">Video</option>
          <option value="service">Dịch vụ y khoa</option>
        </select>
        <select
          value={filters.categoryId}
          onChange={(e) => setFilter("categoryId", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Hiển thị</option>
          <option value="0">Ẩn</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        ) : !data?.data?.length ? (
          <p className="text-sm text-muted-foreground">Chưa có nội dung nào.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="text-center">Loại</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Hot</TableHead>
                  <TableHead className="text-center">Lượt xem</TableHead>
                  <TableHead className="text-center">Xuất bản</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{TYPE_LABELS[item.contentType] ?? item.contentType}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {categoryMap[item.categoryId] ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.status === 1 ? "default" : "secondary"}>
                        {item.status === 1 ? "Hiển thị" : "Ẩn"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isHot && <Flame className="size-4 text-orange-500 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-center text-sm">{item.viewCount}</TableCell>
                    <TableCell className="text-center text-sm">{formatDate(item.publishedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/tin-tuc/${item.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button size="icon" variant="ghost" title="Xem trang chi tiết">
                            <ExternalLink className="size-4 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(item.id)}>
                          <Edit className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(item)}>
                          <Trash2 className="size-4 text-destructive" />
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
      <CreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
        onSuccess={() => loadData()}
      />

      {/* Edit Drawer */}
      <EditDrawer
        contentId={editTarget}
        open={editOpen}
        onOpenChange={(v) => { setEditOpen(v); if (!v) setEditTarget(null); }}
        categories={categories}
        onSuccess={() => loadData()}
      />

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa{" "}
            <span className="font-medium text-foreground">"{deleteTarget?.title}"</span>?
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
