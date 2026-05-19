import * as React from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "~/components/ui/drawer";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/components/ui/dialog";
import Pagination from "~/components/shared/Pagination";
import { getPagedDoctors, createDoctor, updateDoctor, deleteDoctor } from "~/services/doctor.service";
import { getAllDepartments } from "~/services/department.service";
import type { DoctorDto, DepartmentDto } from "~/types/doctor";
import { DoctorForm } from "./DoctorForm";
import type { FormValues } from "./DoctorForm";

export function meta() {
  return [{ title: "Quản lý bác sĩ | Hospital TTG" }];
}

const PAGE_SIZE = 10;

export default function DoctorsPage() {
  const [items, setItems] = React.useState<DoctorDto[]>([]);
  const [departments, setDepartments] = React.useState<DepartmentDto[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<DoctorDto | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = React.useState(false);
  const [editSubmitting, setEditSubmitting] = React.useState(false);

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

  async function handleCreate(values: FormValues) {
    setCreateSubmitting(true);
    try {
      const result = await createDoctor({
        ...values,
        departmentId: values.departmentId || null,
        academicTitle: values.academicTitle || null,
        position: values.position || null,
        specialty: values.specialty || null,
        avatarUrl: values.avatarUrl || null,
        bio: values.bio || null,
      });
      toast.success("Thêm bác sĩ thành công.");
      setItems((prev) => [result, ...prev]);
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
      const result = await updateDoctor(editTarget.id, {
        ...values,
        departmentId: values.departmentId || null,
        academicTitle: values.academicTitle || null,
        position: values.position || null,
        specialty: values.specialty || null,
        avatarUrl: values.avatarUrl || null,
        bio: values.bio || null,
      });
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
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Thêm bác sĩ
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
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(doc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(doc.id)}>
                        <Trash2 className="h-4 w-4" />
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

      {/* Create Drawer */}
      <Drawer open={createOpen} onOpenChange={setCreateOpen} className="w-[560px] max-w-[95vw]">
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle>Thêm bác sĩ mới</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <DoctorForm
            formId="create-doctor-form"
            departments={departments}
            onSubmit={handleCreate}
          />
        </div>
        <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSubmitting}>Hủy</Button>
          <Button type="submit" form="create-doctor-form" disabled={createSubmitting}>
            {createSubmitting ? "Đang lưu..." : "Thêm mới"}
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }} className="w-[560px] max-w-[95vw]">
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle>Chỉnh sửa bác sĩ</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {editTarget && (
            <DoctorForm
              key={editTarget.id}
              formId="edit-doctor-form"
              defaultValues={{
                fullName: editTarget.fullName,
                academicTitle: editTarget.academicTitle ?? "",
                position: editTarget.position ?? "",
                departmentId: editTarget.departmentId ?? "",
                specialty: editTarget.specialty ?? "",
                avatarUrl: editTarget.avatarUrl ?? "",
                bio: editTarget.bio ?? "",
                sortOrder: editTarget.sortOrder,
                isActive: editTarget.isActive,
                isManagement: editTarget.isManagement,
                managementOrder: editTarget.managementOrder,
                isHomepageFeatured: editTarget.isHomepageFeatured,
              }}
              departments={departments}
              onSubmit={handleUpdate}
            />
          )}
        </div>
        <DrawerFooter className="border-t px-6 py-4 flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editSubmitting}>Hủy</Button>
          <Button type="submit" form="edit-doctor-form" disabled={editSubmitting}>
            {editSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn xóa bác sĩ này? Thao tác không thể hoàn tác.
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
