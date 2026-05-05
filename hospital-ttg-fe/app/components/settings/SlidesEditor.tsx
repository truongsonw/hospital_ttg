import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import FileUploadInput from "~/components/shared/FileUploadInput";
import type { HomePageSlideDto } from "~/types/home";

interface SlidesEditorProps {
  value: HomePageSlideDto[];
  onChange: (slides: HomePageSlideDto[]) => void;
}

const emptySlide = (sortOrder: number): HomePageSlideDto => ({
  imageUrl: "",
  altText: "",
  title: "",
  description: "",
  linkUrl: "",
  sortOrder,
  isActive: true,
});

export default function SlidesEditor({ value, onChange }: SlidesEditorProps) {
  const slides = value;

  function update(index: number, patch: Partial<HomePageSlideDto>) {
    const next = slides.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((s, i) => ({ ...s, sortOrder: i + 1 })));
  }

  function remove(index: number) {
    const next = slides.filter((_, i) => i !== index).map((s, i) => ({ ...s, sortOrder: i + 1 }));
    onChange(next);
  }

  function add() {
    onChange([...slides, emptySlide(slides.length + 1)]);
  }

  return (
    <div className="space-y-3">
      {slides.length === 0 ? (
        <div className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          Chưa có slide nào. Bấm "Thêm slide" bên dưới để tạo mới.
        </div>
      ) : (
        slides.map((slide, index) => (
          <div
            key={index}
            className="rounded-lg border bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                Slide #{index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  title="Lên"
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => move(index, 1)}
                  disabled={index === slides.length - 1}
                  title="Xuống"
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => remove(index)}
                  title="Xoá"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ảnh slide</Label>
                <FileUploadInput
                  value={slide.imageUrl}
                  onChange={(url) => update(index, { imageUrl: url })}
                  accept="image/*"
                  label="ảnh slide"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Văn bản thay thế (alt)</Label>
                <Input
                  value={slide.altText ?? ""}
                  onChange={(e) => update(index, { altText: e.target.value })}
                  placeholder="VD: Bệnh viện TTG"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tiêu đề (tuỳ chọn)</Label>
                <Input
                  value={slide.title ?? ""}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>URL liên kết (tuỳ chọn)</Label>
                <Input
                  value={slide.linkUrl ?? ""}
                  onChange={(e) => update(index, { linkUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Mô tả ngắn (tuỳ chọn)</Label>
                <Textarea
                  rows={2}
                  value={slide.description ?? ""}
                  onChange={(e) => update(index, { description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
              <Label className="cursor-pointer">Hoạt động</Label>
              <Switch
                checked={slide.isActive}
                onCheckedChange={(v) => update(index, { isActive: v })}
              />
            </div>
          </div>
        ))
      )}

      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="size-4 mr-1" /> Thêm slide
      </Button>
    </div>
  );
}
