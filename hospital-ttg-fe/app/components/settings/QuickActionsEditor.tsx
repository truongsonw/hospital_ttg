import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { HomePageQuickActionDto } from "~/types/home";

interface QuickActionsEditorProps {
  value: HomePageQuickActionDto[];
  onChange: (actions: HomePageQuickActionDto[]) => void;
}

const ICON_OPTIONS = [
  { value: "phone", label: "Điện thoại" },
  { value: "calendar", label: "Lịch (đặt lịch)" },
  { value: "clipboard-list", label: "Bảng/Danh sách" },
];

const KIND_OPTIONS = [
  { value: "link", label: "Liên kết URL" },
  { value: "booking", label: "Mở popup đặt lịch" },
];

const empty = (sortOrder: number): HomePageQuickActionDto => ({
  key: `action-${sortOrder}`,
  title: "",
  description: "",
  icon: "clipboard-list",
  url: "",
  kind: "link",
  sortOrder,
  isActive: true,
});

export default function QuickActionsEditor({ value, onChange }: QuickActionsEditorProps) {
  const actions = value;

  function update(index: number, patch: Partial<HomePageQuickActionDto>) {
    onChange(actions.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= actions.length) return;
    const next = [...actions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((a, i) => ({ ...a, sortOrder: i + 1 })));
  }

  function remove(index: number) {
    onChange(actions.filter((_, i) => i !== index).map((a, i) => ({ ...a, sortOrder: i + 1 })));
  }

  function add() {
    onChange([...actions, empty(actions.length + 1)]);
  }

  return (
    <div className="space-y-3">
      {actions.length === 0 ? (
        <div className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          Chưa có thao tác nhanh nào.
        </div>
      ) : (
        actions.map((action, index) => (
          <div
            key={index}
            className="rounded-lg border bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">Thao tác #{index + 1}</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => move(index, 1)}
                  disabled={index === actions.length - 1}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mã định danh (key)</Label>
                <Input
                  value={action.key}
                  onChange={(e) => update(index, { key: e.target.value })}
                  placeholder="hotline / booking / lab-result..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tiêu đề *</Label>
                <Input
                  value={action.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                  placeholder="VD: Đặt lịch khám"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Select
                  value={action.icon ?? ""}
                  onValueChange={(v) => update(index, { icon: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Loại hành động</Label>
                <Select
                  value={action.kind}
                  onValueChange={(v) => update(index, { kind: v ?? "link" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KIND_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {action.kind === "link" && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label>URL</Label>
                  <Input
                    value={action.url ?? ""}
                    onChange={(e) => update(index, { url: e.target.value })}
                    placeholder="tel:1900xxxx hoặc /trang-tinh hoặc https://..."
                  />
                </div>
              )}
              <div className="space-y-1.5 md:col-span-2">
                <Label>Mô tả</Label>
                <Textarea
                  rows={2}
                  value={action.description ?? ""}
                  onChange={(e) => update(index, { description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
              <Label className="cursor-pointer">Hoạt động</Label>
              <Switch
                checked={action.isActive}
                onCheckedChange={(v) => update(index, { isActive: v })}
              />
            </div>
          </div>
        ))
      )}

      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="size-4 mr-1" /> Thêm thao tác nhanh
      </Button>
    </div>
  );
}
