import * as React from "react";
import { toast } from "sonner";
import { IconTrash, IconMail } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "~/components/ui/dialog";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
} from "~/components/ui/drawer";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import Pagination from "~/components/shared/Pagination";
import { getPagedContacts, updateContactStatus, deleteContact } from "~/services/contact.service";
import {
  ContactStatus,
  CONTACT_STATUS_LABEL,
  CONTACT_STATUS_VARIANT,
  type ContactDto,
} from "~/types/contact";

export function meta() {
  return [{ title: "Liên hệ | Hospital TTG" }];
}

const PAGE_SIZE = 10;

function ContactDetailDrawer({
  contact,
  open,
  onOpenChange,
  onStatusChange,
}: {
  contact: ContactDto | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onStatusChange: (updated: ContactDto) => void;
}) {
  async function markAs(status: ContactStatus) {
    if (!contact || contact.status === status) return;
    try {
      const updated = await updateContactStatus(contact.id, { status });
      onStatusChange(updated);
      toast.success(`Đã cập nhật: ${CONTACT_STATUS_LABEL[status]}`);
    } catch {
      toast.error("Cập nhật thất bại.");
    }
  }

  if (!contact) return null;

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="!w-full max-w-lg ml-auto h-full flex flex-col">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <IconMail className="h-4 w-4 text-gray-500" />
            Chi tiết liên hệ
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Họ tên</p>
              <p className="font-medium">{contact.fullName}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Email</p>
              <p className="font-medium">{contact.email}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Ngày gửi</p>
              <p className="font-medium">{formatDateTime(contact.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Trạng thái</p>
              <Badge variant={CONTACT_STATUS_VARIANT[contact.status]}>
                {CONTACT_STATUS_LABEL[contact.status]}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Chủ đề</p>
            <p className="text-sm font-medium border rounded-md px-3 py-2 bg-gray-50 dark:bg-zinc-800">
              {contact.subject}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Nội dung</p>
            <div className="text-sm border rounded-md px-3 py-3 bg-gray-50 dark:bg-zinc-800 whitespace-pre-wrap leading-relaxed">
              {contact.content}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex flex-wrap gap-2">
          {contact.status === ContactStatus.Unread && (
            <Button variant="outline" size="sm" onClick={() => markAs(ContactStatus.Read)}>
              Đánh dấu đã đọc
            </Button>
          )}
          {contact.status !== ContactStatus.Replied && (
            <Button size="sm" onClick={() => markAs(ContactStatus.Replied)}>
              Đánh dấu đã phản hồi
            </Button>
          )}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default function ContactsPage() {
  const [items, setItems] = React.useState<ContactDto[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<ContactStatus | "">("");
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [selectedContact, setSelectedContact] = React.useState<ContactDto | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPagedContacts({ status: statusFilter, search, page, pageSize: PAGE_SIZE });
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

  async function openDetail(contact: ContactDto) {
    setSelectedContact(contact);
    setDrawerOpen(true);

    // Tự động đánh dấu đã đọc khi mở
    if (contact.status === ContactStatus.Unread) {
      try {
        const updated = await updateContactStatus(contact.id, { status: ContactStatus.Read });
        setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSelectedContact(updated);
      } catch {
        // silent fail
      }
    }
  }

  function handleStatusChange(updated: ContactDto) {
    setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedContact(updated);
  }

  async function handleDelete(id: string) {
    try {
      await deleteContact(id);
      toast.success("Đã xóa liên hệ.");
      setDeleteId(null);
      if (selectedContact?.id === id) { setDrawerOpen(false); setSelectedContact(null); }
      fetchData();
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại.");
    }
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b dark:border-zinc-800">
        <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Liên hệ</h2>
        <p className="text-sm text-gray-500 mt-0.5">Quản lý tin nhắn liên hệ từ người dùng.</p>
      </div>

      {/* Filters */}
      <div className="p-4 border-b dark:border-zinc-800 flex flex-wrap gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 min-w-48">
          <Input
            placeholder="Tìm theo tên, email, chủ đề..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline" size="sm">Tìm</Button>
        </form>
        <Select
          value={statusFilter === "" ? "all" : String(statusFilter)}
          onValueChange={(v) => { setStatusFilter(v === "all" ? "" : (Number(v) as ContactStatus)); setPage(1); }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.values(ContactStatus).filter((v) => typeof v === "number").map((s) => (
              <SelectItem key={s} value={String(s)}>{CONTACT_STATUS_LABEL[s as ContactStatus]}</SelectItem>
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
              <TableHead>Email</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày gửi</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">Đang tải...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">Không có dữ liệu.</TableCell>
              </TableRow>
            ) : (
              items.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800"
                  onClick={() => openDetail(c)}
                >
                  <TableCell className="font-medium">
                    {c.status === ContactStatus.Unread && (
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle" />
                    )}
                    {c.fullName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-zinc-400">{c.email}</TableCell>
                  <TableCell className="max-w-56 truncate text-sm">{c.subject}</TableCell>
                  <TableCell>
                    <Badge variant={CONTACT_STATUS_VARIANT[c.status]}>
                      {CONTACT_STATUS_LABEL[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{formatDateTime(c.createdAt)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(c.id)}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t dark:border-zinc-800 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Detail drawer */}
      <ContactDetailDrawer
        contact={selectedContact}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onStatusChange={handleStatusChange}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Bạn có chắc muốn xóa tin nhắn liên hệ này không?
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
