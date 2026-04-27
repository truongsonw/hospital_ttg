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
import Pagination from "~/components/shared/Pagination";
import TiptapEditor from "~/components/shared/TiptapEditor";
import { getPagedDoctors, createDoctor, updateDoctor, deleteDoctor } from "~/services/doctor.service";
import { getAllDepartments } from "~/services/department.service";
import type { DoctorDto, DepartmentDto } from "~/types/doctor";

export function meta() {
  return [{ title: "Quản lý bác sĩ | Hospital TTG" }];
}

const PAGE_SIZE = 10;

const schema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên").max(200),
  academicTitle: z.string().max(100).optional(),
  position: z.string().max(200).optional(),
  departmentId: z.string().optional(),
  specialty: z.string().max(200).optional(),
  avatarUrl: z.string().max(500).optional(),
  bio: z.string().optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  isManagement: z.boolean(),
  managementOrder: z.number().int(),
});
type FormValues = z.infer<typeof schema>;

function DoctorDialog({
  open,
  onOpenChange,
  initial,
  departments,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: DoctorDto | null;
  departments: DepartmentDto[];
  onSuccess: (doctor: DoctorDto) => void;
}) {
  const isEdit = !!initial;
  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      values: initial
        ? {
            fullName: initial.fullName,
            academicTitle: initial.academicTitle ?? "",
            position: initial.position ?? "",
            departmentId: initial.departmentId ?? "",
            specialty: initial.specialty ?? "",
            avatarUrl: initial.avatarUrl ?? "",
            bio: initial.bio ?? "",
            sortOrder: initial.sortOrder,
            isActive: initial.isActive,
            isManagement: initial.isManagement,
            managementOrder: initial.managementOrder,
          }
        : { fullName: "", academicTitle: "", position: "", departmentId: "", specialty: "", avatarUrl: "", bio: "", sortOrder: 0, isActive: true, isManagement: false, managementOrder: 0 },
    });

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        departmentId: values.departmentId || null,
        academicTitle: values.academicTitle || null,
        position: values.position || null,
        specialty: values.specialty || null,
        avatarUrl: values.avatarUrl || null,
        bio: values.bio || null,
        isManagement: values.isManagement,
        managementOrder: values.managementOrder,
      };
      const result = isEdit
        ? await updateDoctor(initial!.id, payload)
        : await createDoctor(payload);
      toast.success(isEdit ? "Cập nhật thành công." : "Thêm bác sĩ thành công.");
      onSuccess(result);
      onOpenChange(false);
    } catch {
      toast.error("Thao tác thất bại, vui lòng thử lại.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa bác sĩ" : "Thêm bác sĩ mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="fullName">Họ và tên *</Label>
              <Input id="fullName" placeholder="Nguyễn Văn A" {...register("fullName")} />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academicTitle">Học hàm / Học vị</Label>
              <Input id="academicTitle" placeholder="PGS.TS., BSCK II, ThS.BS." {...register("academicTitle")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">Chức vụ</Label>
              <Input id="position" placeholder="Trưởng khoa" {...register("position")} />
            </div>
            <div className="space-y-1.5">
              <Label>Khoa</Label>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khoa..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— Không chọn —</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialty">Chuyên khoa</Label>
              <Input id="specialty" placeholder="Nhi khoa, Ngoại tiêu hóa..." {...register("specialty")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl">URL ảnh đại diện</Label>
            <Input id="avatarUrl" placeholder="https://..." {...register("avatarUrl")} />
            {watch("avatarUrl") && (
              <img src={watch("avatarUrl")} alt="preview" className="h-20 w-20 rounded-full object-cover mt-2" />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Giới thiệu</Label>
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <TiptapEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Giới thiệu ngắn về bác sĩ..."
                  minHeight={180}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Thứ tự hiển thị</Label>
              <Input id="sortOrder" type="number" {...register("sortOrder", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Hiển thị</Label>
              <div className="flex items-center h-10">
                <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ban lãnh đạo</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Thuộc ban lãnh đạo</p>
                <p className="text-xs text-gray-500">Hiển thị trong trang Bộ máy quản lý</p>
              </div>
              <Switch checked={watch("isManagement")} onCheckedChange={(v) => setValue("isManagement", v)} />
            </div>
            {watch("isManagement") && (
              <div className="space-y-1.5">
                <Label htmlFor="managementOrder">Thứ tự trong BLĐ</Label>
                <Input id="managementOrder" type="number" placeholder="1 = Giám đốc, 2 = Phó GĐ..." {...register("managementOrder", { valueAsNumber: true })} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DoctorsPage() {
  const [items, setItems] = React.useState<DoctorDto[]>([]);
  const [departments, setDepartments] = React.useState<DepartmentDto[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<DoctorDto | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const fetchDoctors = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPagedDoctors({
        departmentId: deptFilter || undefined,
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      toast.error("Không thể tải danh sách bác sĩ.");
    } finally {
      setLoading(false);
    }
  }, [deptFilter, search, page]);

  React.useEffect(() => { fetchDoctors(); }, [fetchDoctors]);
  React.useEffect(() => { getAllDepartments().then(setDepartments).catch(() => {}); }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleSuccess(doctor: DoctorDto) {
    setItems((prev) => {
      const idx = prev.findIndex((d) => d.id === doctor.id);
      if (idx >= 0) return prev.map((d) => (d.id === doctor.id ? doctor : d));
      return [doctor, ...prev];
    });
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoctor(id);
      toast.success("Đã xóa bác sĩ.");
      setItems((prev) => prev.filter((d) => d.id !== id));
      setDeleteId(null);
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại.");
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      <div className="p-6 border-b dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Quản lý bác sĩ</h2>
          <p className="text-sm text-gray-500 mt-0.5">Đội ngũ bác sĩ và chuyên gia của bệnh viện.</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <IconPlus className="h-4 w-4 mr-1" /> Thêm bác sĩ
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b dark:border-zinc-800 flex flex-wrap gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-48">
          <Input
            placeholder="Tìm theo tên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline" size="sm">Tìm</Button>
        </form>
        <Select value={deptFilter || "all"} onValueChange={(v) => { setDeptFilter(!v || v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tất cả khoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khoa</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ảnh</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Học hàm</TableHead>
              <TableHead>Khoa</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Thứ tự</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-gray-400">Đang tải...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-10 text-gray-400">Không có dữ liệu.</TableCell></TableRow>
            ) : (
              items.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    {doc.avatarUrl
                      ? <img src={doc.avatarUrl} alt={doc.fullName} className="h-10 w-10 rounded-full object-cover" />
                      : <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-400 text-xs">?</div>
                    }
                  </TableCell>
                  <TableCell className="font-medium">{doc.fullName}</TableCell>
                  <TableCell className="text-sm text-gray-500">{doc.academicTitle ?? "—"}</TableCell>
                  <TableCell className="text-sm">{doc.departmentName ?? "—"}</TableCell>
                  <TableCell className="text-sm text-gray-500">{doc.position ?? "—"}</TableCell>
                  <TableCell>{doc.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={doc.isActive ? "default" : "secondary"}>
                      {doc.isActive ? "Hiển thị" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(doc); setDialogOpen(true); }}>
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(doc.id)}>
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

      <div className="p-4 border-t dark:border-zinc-800 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <DoctorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        departments={departments}
        onSuccess={handleSuccess}
      />

      <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Bạn có chắc muốn xóa bác sĩ này? Thao tác không thể hoàn tác.
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
