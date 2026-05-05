import * as React from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { ApiError } from "~/lib/api";
import {
  getAllCategoriesList,
  getCategoryById,
  updateCategory,
} from "~/services/category.service";
import {
  getPagedContents,
  getContentById,
  updateContent,
} from "~/services/content.service";
import {
  getAllDepartments,
  updateDepartment,
} from "~/services/department.service";
import {
  getPagedDoctors,
  getDoctorById,
  updateDoctor,
} from "~/services/doctor.service";
import type { CategoryDto, ContentDto } from "~/types/article";
import type { DepartmentDto, DoctorDto } from "~/types/doctor";

type Mode = "categories" | "contents" | "departments" | "doctors";

export default function HomepageQuickPicker() {
  return (
    <Tabs defaultValue="contents" className="w-full">
      <TabsList className="grid grid-cols-4 w-full max-w-2xl">
        <TabsTrigger value="contents">Bài viết</TabsTrigger>
        <TabsTrigger value="categories">Danh mục</TabsTrigger>
        <TabsTrigger value="departments">Khoa</TabsTrigger>
        <TabsTrigger value="doctors">Bác sĩ</TabsTrigger>
      </TabsList>

      <TabsContent value="contents" className="mt-4">
        <ContentsPanel />
      </TabsContent>
      <TabsContent value="categories" className="mt-4">
        <CategoriesPanel />
      </TabsContent>
      <TabsContent value="departments" className="mt-4">
        <DepartmentsPanel />
      </TabsContent>
      <TabsContent value="doctors" className="mt-4">
        <DoctorsPanel />
      </TabsContent>
    </Tabs>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ContentsPanel() {
  const [items, setItems] = React.useState<ContentDto[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    getPagedContents({ page: 1, pageSize: 50 })
      .then((res) => setItems(res.data ?? []))
      .catch(() => toast.error("Không tải được nội dung."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  async function toggle(item: ContentDto, next: boolean) {
    setPendingId(item.id);
    try {
      const full = await getContentById(item.id);
      await updateContent(item.id, {
        ...full,
        intro: full.intro ?? null,
        body: full.body ?? null,
        thumbnail: full.thumbnail ?? null,
        fileAttach: full.fileAttach ?? null,
        tags: full.tags ?? null,
        publishedAt: full.publishedAt ?? null,
        isHomepageFeatured: next,
      });
      setItems((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, isHomepageFeatured: next } : c)),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Lưu thất bại");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tiêu đề..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có kết quả.</p>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto rounded-md border p-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.contentType} · {item.slug}
                </p>
              </div>
              <Switch
                checked={item.isHomepageFeatured}
                disabled={pendingId === item.id}
                onCheckedChange={(v) => toggle(item, v)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function CategoriesPanel() {
  const [items, setItems] = React.useState<CategoryDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    getAllCategoriesList()
      .then(setItems)
      .catch(() => toast.error("Không tải được danh mục."))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(item: CategoryDto, next: boolean) {
    setPendingId(item.id);
    try {
      const full = await getCategoryById(item.id);
      await updateCategory(item.id, {
        ...full,
        parentId: full.parentId ?? null,
        isHomepageFeatured: next,
      });
      setItems((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, isHomepageFeatured: next } : c)),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Lưu thất bại");
    } finally {
      setPendingId(null);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto rounded-md border p-2">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Chưa có danh mục.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
          >
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <Label className="text-sm truncate">{item.name}</Label>
              <Badge variant="outline" className="text-xs">
                {item.type}
              </Badge>
            </div>
            <Switch
              checked={item.isHomepageFeatured}
              disabled={pendingId === item.id}
              onCheckedChange={(v) => toggle(item, v)}
            />
          </div>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function DepartmentsPanel() {
  const [items, setItems] = React.useState<DepartmentDto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    getAllDepartments()
      .then(setItems)
      .catch(() => toast.error("Không tải được khoa."))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(item: DepartmentDto, next: boolean) {
    setPendingId(item.id);
    try {
      await updateDepartment(item.id, {
        name: item.name,
        description: item.description ?? null,
        parentId: item.parentId ?? null,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        isHomepageFeatured: next,
      });
      setItems((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, isHomepageFeatured: next } : d)),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Lưu thất bại");
    } finally {
      setPendingId(null);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto rounded-md border p-2">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Chưa có khoa.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
          >
            <Label className="text-sm flex-1 truncate">{item.name}</Label>
            <Switch
              checked={item.isHomepageFeatured}
              disabled={pendingId === item.id}
              onCheckedChange={(v) => toggle(item, v)}
            />
          </div>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function DoctorsPanel() {
  const [items, setItems] = React.useState<DoctorDto[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    getPagedDoctors({ page: 1, pageSize: 100 })
      .then((res) => setItems(res.data ?? []))
      .catch(() => toast.error("Không tải được bác sĩ."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((d) =>
    d.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  async function toggle(item: DoctorDto, next: boolean) {
    setPendingId(item.id);
    try {
      const full = await getDoctorById(item.id);
      await updateDoctor(item.id, {
        fullName: full.fullName,
        academicTitle: full.academicTitle ?? null,
        position: full.position ?? null,
        departmentId: full.departmentId ?? null,
        specialty: full.specialty ?? null,
        avatarUrl: full.avatarUrl ?? null,
        bio: full.bio ?? null,
        sortOrder: full.sortOrder,
        isActive: full.isActive,
        isManagement: full.isManagement,
        managementOrder: full.managementOrder,
        isHomepageFeatured: next,
      });
      setItems((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, isHomepageFeatured: next } : d)),
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Lưu thất bại");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không có kết quả.</p>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto rounded-md border p-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.academicTitle ? `${item.academicTitle} ` : ""}
                  {item.fullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.departmentName ?? item.position ?? "—"}
                </p>
              </div>
              <Switch
                checked={item.isHomepageFeatured}
                disabled={pendingId === item.id}
                onCheckedChange={(v) => toggle(item, v)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
