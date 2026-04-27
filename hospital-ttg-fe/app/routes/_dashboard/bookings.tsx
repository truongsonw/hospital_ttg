import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { IconTrash, IconChevronDown } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "~/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import Pagination from "~/components/shared/Pagination";
import { getPagedBookings, updateBookingStatus, deleteBooking } from "~/services/booking.service";
import {
  BookingStatus,
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_VARIANT,
  type BookingDto,
} from "~/types/booking";

export function meta() {
  return [{ title: "Đặt lịch khám | Hospital TTG" }];
}

// ── Update Status Dialog ───────────────────────────────────────────────────────

const updateSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  note: z.string().max(1000).optional(),
});
type UpdateValues = z.infer<typeof updateSchema>;

const STATUS_TRANSITIONS: Record<BookingStatus, { label: string; next: BookingStatus }[]> = {
  [BookingStatus.Pending]: [
    { label: "Xác nhận lịch", next: BookingStatus.Confirmed },
    { label: "Hủy lịch", next: BookingStatus.Cancelled },
  ],
  [BookingStatus.Confirmed]: [
    { label: "Hoàn thành", next: BookingStatus.Completed },
    { label: "Hủy lịch", next: BookingStatus.Cancelled },
  ],
  [BookingStatus.Completed]: [],
  [BookingStatus.Cancelled]: [],
};

function UpdateStatusDialog({
  booking,
  nextStatus,
  open,
  onOpenChange,
  onSuccess,
}: {
  booking: BookingDto;
  nextStatus: BookingStatus;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (updated: BookingDto) => void;
}) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<UpdateValues>({
    resolver: zodResolver(updateSchema),
    values: { status: nextStatus, note: booking.note ?? "" },
  });

  async function onSubmit(values: UpdateValues) {
    try {
      const updated = await updateBookingStatus(booking.id, { status: values.status, note: values.note });
      toast.success("Cập nhật trạng thái thành công.");
      onSuccess(updated);
      onOpenChange(false);
    } catch {
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Cập nhật trạng thái → <span className="font-semibold">{BOOKING_STATUS_LABEL[nextStatus]}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="note">Ghi chú lý do (tuỳ chọn)</Label>
            <Textarea id="note" rows={3} placeholder="Nhập ghi chú..." {...register("note")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function BookingsPage() {
  const [items, setItems] = React.useState<BookingDto[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "">("");
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [updateDialog, setUpdateDialog] = React.useState<{
    booking: BookingDto;
    nextStatus: BookingStatus;
  } | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPagedBookings({ status: statusFilter, search, page, pageSize: PAGE_SIZE });
      setItems(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function handleDelete(id: string) {
    try {
      await deleteBooking(id);
      toast.success("Đã xóa lịch hẹn.");
      setDeleteId(null);
      fetchData();
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại.");
    }
  }

  function handleStatusUpdated(updated: BookingDto) {
    setItems((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setUpdateDialog(null);
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Đặt lịch khám</h2>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý lịch hẹn của bệnh nhân.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b dark:border-zinc-800 flex flex-wrap gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-48">
          <Input
            placeholder="Tìm theo tên, số điện thoại..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline" size="sm">Tìm</Button>
        </form>
        <Select
          value={statusFilter === "" ? "all" : String(statusFilter)}
          onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (Number(v) as BookingStatus)); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.values(BookingStatus).filter((v) => typeof v === "number").map((s) => (
              <SelectItem key={s} value={String(s)}>{BOOKING_STATUS_LABEL[s as BookingStatus]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Ngày hẹn</TableHead>
              <TableHead>Triệu chứng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">Đang tải...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">Không có dữ liệu.</TableCell>
              </TableRow>
            ) : (
              items.map((b) => {
                const transitions = STATUS_TRANSITIONS[b.status];
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.fullName}</TableCell>
                    <TableCell>{b.phoneNumber}</TableCell>
                    <TableCell>{formatDate(b.appointmentDate)}</TableCell>
                    <TableCell className="max-w-48 truncate text-sm text-gray-500">
                      {b.symptoms ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={BOOKING_STATUS_VARIANT[b.status]}>
                        {BOOKING_STATUS_LABEL[b.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{formatDateTime(b.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {transitions.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="outline" size="sm">
                                  Cập nhật <IconChevronDown className="ml-1 h-3 w-3" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              {transitions.map((t) => (
                                <DropdownMenuItem
                                  key={t.next}
                                  onClick={() => setUpdateDialog({ booking: b, nextStatus: t.next })}
                                >
                                  {t.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(b.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t dark:border-zinc-800 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Update status dialog */}
      {updateDialog && (
        <UpdateStatusDialog
          booking={updateDialog.booking}
          nextStatus={updateDialog.nextStatus}
          open={true}
          onOpenChange={(v) => { if (!v) setUpdateDialog(null); }}
          onSuccess={handleStatusUpdated}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Bạn có chắc muốn xóa lịch hẹn này không? Thao tác không thể hoàn tác.
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
