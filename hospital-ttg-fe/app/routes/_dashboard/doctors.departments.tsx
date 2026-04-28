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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from "~/components/ui/drawer";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
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

function DepartmentForm({
  formId,
  defaultValues,
  allDepts,
  excludeId,
  onSubmit,
}: {
  formId: string;
  defaultValues?: Partial<FormValues>;
  allDepts: DepartmentDto[];
  excludeId?: string;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const topLevel = allDepts.filter((d) => !d.parentId && d.id !== excludeId);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      parentId: "",
      sortOrder: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Tên khoa *</Label>
        <Input placeholder="VD: Khoa Nhi" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Thuộc nhóm (để trống nếu là nhóm gốc)</Label>
        <select
          {...register("parentId")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">— Không có (nhóm gốc) —</option>
          {topLevel.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label>Mô tả</Label>
        <Textarea rows={3} placeholder="Mô tả ngắn..." {...register("description")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Thứ tự</Label>
          <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label>Hiển thị</Label>
          <div className="flex items-center h-10">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default function DepartmentsPage() {
  const [items, setItems] = React.useState<DepartmentDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<DepartmentDto | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = React.useState(false);
  const [editSubmitting, setEditSubmitting] = React.useState(false);

  async function load() {
    setLoading(true);
    try { setItems(await getAllDepartments()); }
    catch { toast.error("Không thể tải danh sách khoa."); }
    finally { setLoading(false); }
  }

  React.useEffect(() => { load(); }, []);

  async function handleCreate(values: FormValues) {
    setCreateSubmitting(true);
    try {
      const result = await createDepartment({ ...values, parentId: values.parentId || null });
      toast.success("Thêm khoa thành công.");
      setItems((prev) => [...prev, result]);
      setCreateOpen(false);
    } catch {
      toast.error("Thao tác thất bại, vui lòng thử lại.");
    } finally {
      setCreateSubmitting(false);
    }
  }

  async function handleUpdate(values: FormValues) {
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      const result = await updateDepartment(editTarget.id, { ...values, parentId: values.parentId || null });
      toast.success("Cập nhật thành công.");
      setItems((prev) => prev.map((d) => (d.id === result.id ? result : d)));
      setEditTarget(null);
    } catch {
      toast.error("Thao tác thất bại, vui lòng thử lại.");
    } finally {
      setEditSubmitting(false);
    }
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

  // Build tree display rows
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
        <Button onClick={() => setCreateOpen(true)}>
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
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(dept)}>
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

      {/* Create Drawer */}
      <Drawer open={createOpen} onOpenChange={setCreateOpen} direction="right">
        <DrawerContent className="w-[480px]! max-w-[95vw]! flex flex-col">
          <DrawerHeader className="border-b px-6 py-4">
            <DrawerTitle>Thêm khoa mới</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <DepartmentForm
              formId="create-dept-form"
              allDepts={items}
              onSubmit={handleCreate}
            />
          </div>
          <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSubmitting}>Hủy</Button>
            <Button type="submit" form="create-dept-form" disabled={createSubmitting}>
              {createSubmitting ? "Đang lưu..." : "Thêm mới"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }} direction="right">
        <DrawerContent className="w-[480px]! max-w-[95vw]! flex flex-col">
          <DrawerHeader className="border-b px-6 py-4">
            <DrawerTitle>Chỉnh sửa khoa</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {editTarget && (
              <DepartmentForm
                formId="edit-dept-form"
                defaultValues={{
                  name: editTarget.name,
                  description: editTarget.description ?? "",
                  parentId: editTarget.parentId ?? "",
                  sortOrder: editTarget.sortOrder,
                  isActive: editTarget.isActive,
                }}
                allDepts={items}
                excludeId={editTarget.id}
                onSubmit={handleUpdate}
              />
            )}
          </div>
          <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editSubmitting}>Hủy</Button>
            <Button type="submit" form="edit-dept-form" disabled={editSubmitting}>
              {editSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa khoa này? Bác sĩ thuộc khoa sẽ mất liên kết.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
