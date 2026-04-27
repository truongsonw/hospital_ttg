import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { IconTrash, IconPencil, IconPlus } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "~/components/ui/dialog";
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "~/services/department.service";
import type { DepartmentDto } from "~/types/doctor";

export function meta() {
  return [{ title: "Quản lý khoa | Hospital TTG" }];
}

const schema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên khoa").max(200),
  description: z.string().max(1000).optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function DepartmentDialog({
  open,
  onOpenChange,
  initial,
  allDepts,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: DepartmentDto | null;
  allDepts: DepartmentDto[];
  onSuccess: (dept: DepartmentDto) => void;
}) {
  const isEdit = !!initial;
  const topLevel = allDepts.filter((d) => !d.parentId);

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      values: initial
        ? { name: initial.name, description: initial.description ?? "", parentId: initial.parentId ?? "", sortOrder: initial.sortOrder, isActive: initial.isActive }
        : { name: "", description: "", parentId: "", sortOrder: 0, isActive: true },
    });

  async function onSubmit(values: FormValues) {
    try {
      const payload = { ...values, parentId: values.parentId || null };
      const result = isEdit
        ? await updateDepartment(initial!.id, payload)
        : await createDepartment(payload);
      toast.success(isEdit ? "Cập nhật thành công." : "Thêm khoa thành công.");
      onSuccess(result);
      onOpenChange(false);
    } catch {
      toast.error("Thao tác thất bại, vui lòng thử lại.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa khoa" : "Thêm khoa mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tên khoa *</Label>
            <Input id="name" placeholder="VD: Khoa Nhi" {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Thuộc nhóm (để trống nếu là nhóm gốc)</Label>
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="— Không có (nhóm gốc) —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Không có (nhóm gốc) —</SelectItem>
                    {topLevel
                      .filter((d) => d.id !== initial?.id)
                      .map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" rows={3} placeholder="Mô tả ngắn..." {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Thứ tự</Label>
              <Input id="sortOrder" type="number" {...register("sortOrder", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Hiển thị</Label>
              <div className="flex items-center h-10">
                <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DepartmentsPage() {
  const [items, setItems] = React.useState<DepartmentDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DepartmentDto | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setItems(await getAllDepartments()); }
    catch { toast.error("Không thể tải danh sách khoa."); }
    finally { setLoading(false); }
  }

  React.useEffect(() => { load(); }, []);

  function handleSuccess(dept: DepartmentDto) {
    setItems((prev) => {
      const idx = prev.findIndex((d) => d.id === dept.id);
      return idx >= 0 ? prev.map((d) => (d.id === dept.id ? dept : d)) : [...prev, dept];
    });
  }

  async function handleDelete(id: string) {
    try {
      await deleteDepartment(id);
      toast.success("Đã xóa.");
      setItems((prev) => prev.filter((d) => d.id !== id));
      setDeleteId(null);
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại.");
    }
  }

  // Build tree: top-level first, then children indented
  const topLevel = items.filter((d) => !d.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const getChildren = (parentId: string) =>
    items.filter((d) => d.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  const rows: { dept: DepartmentDto; isChild: boolean }[] = [];
  for (const parent of topLevel) {
    rows.push({ dept: parent, isChild: false });
    for (const child of getChildren(parent.id)) {
      rows.push({ dept: child, isChild: true });
    }
  }
  // standalone (no parent and not a parent itself)
  const parentIds = new Set(items.filter((d) => !d.parentId).map((d) => d.id));
  for (const d of items) {
    if (d.parentId && !parentIds.has(d.parentId)) {
      rows.push({ dept: d, isChild: false });
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      <div className="p-6 border-b dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Quản lý khoa</h2>
          <p className="text-sm text-gray-500 mt-0.5">Nhóm và khoa/chuyên khoa trong bệnh viện.</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <IconPlus className="h-4 w-4 mr-1" /> Thêm khoa
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-400">Đang tải...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-400">Chưa có khoa nào.</TableCell></TableRow>
            ) : (
              rows.map(({ dept, isChild }) => (
                <TableRow key={dept.id} className={isChild ? "bg-gray-50/50 dark:bg-zinc-800/30" : ""}>
                  <TableCell className="font-medium">
                    {isChild ? (
                      <span className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                        <span className="text-gray-300 dark:text-zinc-600 select-none">└─</span>
                        {dept.name}
                      </span>
                    ) : (
                      <span className="font-semibold">{dept.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-64 truncate text-sm text-gray-500">{dept.description ?? "—"}</TableCell>
                  <TableCell>{dept.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={dept.isActive ? "default" : "secondary"}>
                      {dept.isActive ? "Hiển thị" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(dept); setDialogOpen(true); }}>
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(dept.id)}>
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DepartmentDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing} allDepts={items} onSuccess={handleSuccess} />

      <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Bạn có chắc muốn xóa khoa này? Bác sĩ thuộc khoa sẽ mất liên kết.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
