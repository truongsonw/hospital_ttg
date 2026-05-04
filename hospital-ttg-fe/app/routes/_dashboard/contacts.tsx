import * as React from "react";
import { toast } from "sonner";
import { Trash2, Mail } from "lucide-react";
import { XIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { ApiError } from "~/lib/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "~/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import Pagination from "~/components/shared/Pagination";
import { deleteContact, getPagedContacts, replyContact, updateContactStatus } from "~/services/contact.service";
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

function getReplySubject(subject: string) {
  const trimmed = subject.trim();
  return trimmed.toLowerCase().startsWith("re:") ? trimmed : `Re: ${trimmed}`;
}

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
  const [replyOpen, setReplyOpen] = React.useState(false);
  const [replySubject, setReplySubject] = React.useState("");
  const [replyBody, setReplyBody] = React.useState("");
  const [replySubmitting, setReplySubmitting] = React.useState(false);
  const [replyError, setReplyError] = React.useState<string | null>(null);
  const [replySuccess, setReplySuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!contact) return;
    setReplySubject(getReplySubject(contact.subject));
    setReplyBody("");
    setReplyError(null);
    setReplySuccess(null);
  }, [contact]);

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

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact || replySubmitting) return;

    const subject = replySubject.trim();
    const body = replyBody.trim();

    if (!subject) {
      setReplyError("Vui lòng nhập chủ đề phản hồi.");
      return;
    }

    if (!body) {
      setReplyError("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    setReplySubmitting(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      const updated = await replyContact(contact.id, { subject, body });
      onStatusChange(updated);
      setReplySuccess("Đã gửi email phản hồi.");
      toast.success("Đã gửi email phản hồi.");
    } catch (err) {
      setReplyError(err instanceof ApiError ? err.message : "Gửi email phản hồi thất bại.");
    } finally {
      setReplySubmitting(false);
    }
  }

  function openReplyDialog() {
    if (!contact) return;
    setReplySubject(getReplySubject(contact.subject));
    setReplyBody("");
    setReplyError(null);
    setReplySuccess(null);
    setReplyOpen(true);
  }

  if (!contact) return null;

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Panel */}
      <div
        data-slot="side-panel"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-popover p-0 text-popover-foreground shadow-none",
          "translate-x-0 transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="border-b pb-4">
          <div className="flex items-center justify-between px-6 pt-4">
            <h2 className="font-heading text-base font-medium leading-none flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Chi tiết liên hệ
            </h2>
            <button
              type="button"
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4" />
              <span className="sr-only">Đóng</span>
            </button>
          </div>
        </div>

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
          <Button size="sm" onClick={openReplyDialog}>
            Phản hồi qua email
          </Button>
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

        <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Phản hồi qua email</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply-to">Đến</Label>
                <Input id="reply-to" value={contact.email} readOnly />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-subject">Chủ đề</Label>
                <Input
                  id="reply-subject"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  maxLength={200}
                  disabled={replySubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-body">Nội dung</Label>
                <Textarea
                  id="reply-body"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  maxLength={10000}
                  disabled={replySubmitting}
                  className="min-h-40"
                />
              </div>

              {replyError && <p className="text-sm text-destructive">{replyError}</p>}
              {replySuccess && <p className="text-sm text-green-600 dark:text-green-400">{replySuccess}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReplyOpen(false)} disabled={replySubmitting}>
                  Đóng
                </Button>
                <Button type="submit" disabled={replySubmitting}>
                  {replySubmitting ? "Đang gửi..." : "Gửi phản hồi"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
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
                      <Trash2 className="h-4 w-4" />
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
