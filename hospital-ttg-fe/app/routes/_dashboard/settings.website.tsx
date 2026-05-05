import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Route } from "./+types/settings.website";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import FileUploadInput from "~/components/shared/FileUploadInput";
import SlidesEditor from "~/components/settings/SlidesEditor";
import QuickActionsEditor from "~/components/settings/QuickActionsEditor";
import HomepageQuickPicker from "~/components/settings/HomepageQuickPicker";
import {
  getAllSiteSettings,
  upsertSiteSettings,
  settingsToMap,
} from "~/services/site-settings.service";
import type { SiteSettingDto } from "~/types/system";
import type { HomePageQuickActionDto, HomePageSlideDto } from "~/types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Thông tin website | Hospital TTG" }];
}

// ── Schema ────────────────────────────────────────────────────────────────────

const stringSchema = z.string().optional();
const numberStringSchema = z.string().optional();

const siteSettingsSchema = z.object({
  // General
  site_name: stringSchema,
  site_description: stringSchema,
  logo_url: stringSchema,
  copyright: stringSchema,
  // Contact
  hotline: stringSchema,
  phone: stringSchema,
  email: stringSchema,
  address: stringSchema,
  working_hours: stringSchema,
  // Social
  facebook: stringSchema,
  youtube: stringSchema,
  zalo: stringSchema,
  tiktok: stringSchema,
  // SEO
  meta_title: stringSchema,
  meta_description: stringSchema,
  google_analytics_id: stringSchema,
  // Homepage hero
  homepage_slides: z.array(
    z.object({
      imageUrl: z.string(),
      altText: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      linkUrl: z.string().nullable().optional(),
      sortOrder: z.number(),
      isActive: z.boolean(),
    }),
  ),
  homepage_quick_actions: z.array(
    z.object({
      key: z.string(),
      title: z.string(),
      description: z.string().nullable().optional(),
      icon: z.string().nullable().optional(),
      url: z.string().nullable().optional(),
      kind: z.string(),
      sortOrder: z.number(),
      isActive: z.boolean(),
    }),
  ),
  // Departments section
  homepage_departments_section_subtitle: stringSchema,
  homepage_departments_section_title: stringSchema,
  homepage_departments_section_description: stringSchema,
  homepage_departments_section_button_text: stringSchema,
  homepage_departments_section_button_url: stringSchema,
  homepage_departments_limit: numberStringSchema,
  homepage_departments_image_1: stringSchema,
  homepage_departments_image_2: stringSchema,
  // Doctors section
  homepage_doctors_section_subtitle: stringSchema,
  homepage_doctors_section_title: stringSchema,
  homepage_doctors_section_description: stringSchema,
  homepage_doctors_section_button_text: stringSchema,
  homepage_doctors_section_button_url: stringSchema,
  homepage_doctors_limit: numberStringSchema,
  // Default content section limit
  homepage_section_default_limit: numberStringSchema,
});

type FormValues = z.infer<typeof siteSettingsSchema>;

const PLAIN_KEYS = [
  "site_name",
  "site_description",
  "logo_url",
  "copyright",
  "hotline",
  "phone",
  "email",
  "address",
  "working_hours",
  "facebook",
  "youtube",
  "zalo",
  "tiktok",
  "meta_title",
  "meta_description",
  "google_analytics_id",
  "homepage_departments_section_subtitle",
  "homepage_departments_section_title",
  "homepage_departments_section_description",
  "homepage_departments_section_button_text",
  "homepage_departments_section_button_url",
  "homepage_departments_limit",
  "homepage_doctors_section_subtitle",
  "homepage_doctors_section_title",
  "homepage_doctors_section_description",
  "homepage_doctors_section_button_text",
  "homepage_doctors_section_button_url",
  "homepage_doctors_limit",
  "homepage_section_default_limit",
] as const satisfies readonly (keyof FormValues)[];

function parseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function buildDefaults(): FormValues {
  const base = Object.fromEntries(PLAIN_KEYS.map((k) => [k, ""])) as Record<string, string>;
  return {
    ...base,
    homepage_departments_image_1: "",
    homepage_departments_image_2: "",
    homepage_slides: [],
    homepage_quick_actions: [],
  } as FormValues;
}

// ── Page ──────────────────────────────────────────────────────────────────────

function SiteSettingsForm() {
  const [loading, setLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: buildDefaults(),
  });

  React.useEffect(() => {
    getAllSiteSettings()
      .then((settings) => {
        const map = settingsToMap(settings as SiteSettingDto[]);
        const slides = parseJson<HomePageSlideDto[]>(map.homepage_slides_json, []);
        const quickActions = parseJson<HomePageQuickActionDto[]>(
          map.homepage_quick_actions_json,
          [],
        );
        const departmentsImages = parseJson<string[]>(
          map.homepage_departments_images_json,
          [],
        );

        const next: FormValues = {
          ...buildDefaults(),
          ...Object.fromEntries(PLAIN_KEYS.map((k) => [k, map[k] ?? ""])),
          homepage_slides: slides,
          homepage_quick_actions: quickActions,
          homepage_departments_image_1: departmentsImages[0] ?? "",
          homepage_departments_image_2: departmentsImages[1] ?? "",
        } as FormValues;

        reset(next);
      })
      .catch(() => toast.error("Không thể tải cài đặt website."))
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(values: FormValues) {
    try {
      const departmentsImages = [
        values.homepage_departments_image_1,
        values.homepage_departments_image_2,
      ].filter((v): v is string => !!v);

      const items: { key: string; value: string }[] = [
        ...PLAIN_KEYS.map((k) => ({ key: k, value: (values[k] as string) ?? "" })),
        {
          key: "homepage_slides_json",
          value: JSON.stringify(values.homepage_slides ?? []),
        },
        {
          key: "homepage_quick_actions_json",
          value: JSON.stringify(values.homepage_quick_actions ?? []),
        },
        {
          key: "homepage_departments_images_json",
          value: JSON.stringify(departmentsImages),
        },
      ];

      await upsertSiteSettings({ settings: items });
      toast.success("Đã lưu cài đặt website.");
      reset(values);
    } catch {
      toast.error("Lưu thất bại, vui lòng thử lại.");
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-500">Đang tải...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="contact">Liên hệ &amp; SEO</TabsTrigger>
          <TabsTrigger value="hero">Banner &amp; Quick Actions</TabsTrigger>
          <TabsTrigger value="sections">Section trang chủ</TabsTrigger>
          <TabsTrigger value="quickpick">Hiển thị trang chủ</TabsTrigger>
        </TabsList>

        {/* ── General ───────────────────────────────────── */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <SectionHeader
            title="Thông tin chung"
            description="Tên, mô tả, logo và thông tin cơ bản của website."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="site_name">Tên bệnh viện</Label>
              <Input id="site_name" placeholder="Bệnh viện TTG" {...register("site_name")} />
            </div>
            <div className="space-y-1.5">
              <Label>Logo</Label>
              <Controller
                name="logo_url"
                control={control}
                render={({ field }) => (
                  <FileUploadInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    accept="image/*"
                    label="ảnh logo"
                  />
                )}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="site_description">Mô tả ngắn</Label>
              <Textarea
                id="site_description"
                rows={2}
                placeholder="Mô tả về bệnh viện..."
                {...register("site_description")}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="copyright">Bản quyền</Label>
              <Input
                id="copyright"
                placeholder="© 2025 Bệnh viện TTG. All rights reserved."
                {...register("copyright")}
              />
            </div>
          </div>
        </TabsContent>

        {/* ── Contact + SEO + Social ────────────────────── */}
        <TabsContent value="contact" className="mt-6 space-y-8">
          <div className="space-y-3">
            <SectionHeader title="Thông tin liên hệ" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="hotline">Đường dây nóng</Label>
                <Input id="hotline" placeholder="1900 xxxx" {...register("hotline")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" placeholder="028 xxxx xxxx" {...register("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email liên hệ</Label>
                <Input id="email" type="email" placeholder="contact@hospital.vn" {...register("email")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="working_hours">Giờ làm việc</Label>
                <Input
                  id="working_hours"
                  placeholder="Thứ 2 – Thứ 7: 7:00 – 17:00"
                  {...register("working_hours")}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  rows={2}
                  placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                  {...register("address")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <SectionHeader title="Mạng xã hội" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" placeholder="https://facebook.com/..." {...register("facebook")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="youtube">YouTube</Label>
                <Input id="youtube" placeholder="https://youtube.com/..." {...register("youtube")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zalo">Zalo</Label>
                <Input id="zalo" placeholder="Số điện thoại Zalo hoặc link OA" {...register("zalo")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input id="tiktok" placeholder="https://tiktok.com/@..." {...register("tiktok")} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <SectionHeader title="SEO" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="meta_title">Meta Title mặc định</Label>
                <Input
                  id="meta_title"
                  placeholder="Bệnh viện TTG – Chăm sóc sức khỏe toàn diện"
                  {...register("meta_title")}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="meta_description">Meta Description mặc định</Label>
                <Textarea
                  id="meta_description"
                  rows={2}
                  placeholder="Mô tả cho công cụ tìm kiếm..."
                  {...register("meta_description")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input id="google_analytics_id" placeholder="G-XXXXXXXXXX" {...register("google_analytics_id")} />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Hero / Quick Actions ───────────────────────── */}
        <TabsContent value="hero" className="mt-6 space-y-8">
          <div className="space-y-3">
            <SectionHeader
              title="Banner trang chủ"
              description="Hình ảnh slide hiển thị ở phần đầu trang chủ. Sắp xếp bằng nút lên/xuống."
            />
            <Controller
              name="homepage_slides"
              control={control}
              render={({ field }) => (
                <SlidesEditor value={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="space-y-3">
            <SectionHeader
              title="Thao tác nhanh (Quick Actions)"
              description="Các nút Đặt lịch / Hotline / Tra cứu nằm dưới banner."
            />
            <Controller
              name="homepage_quick_actions"
              control={control}
              render={({ field }) => (
                <QuickActionsEditor value={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </div>
        </TabsContent>

        {/* ── Sections ───────────────────────────────────── */}
        <TabsContent value="sections" className="mt-6 space-y-10">
          {/* Specialty */}
          <div className="space-y-3">
            <SectionHeader
              title='Section "Chuyên khoa"'
              description='Hiển thị các khoa được tích "Hiển thị trang chủ" trong trang Quản lý khoa.'
            />
            <SectionMetadataFields
              register={register}
              prefix="homepage_departments_section"
              defaultButtonText="Xem tất cả"
              defaultButtonUrl="/doi-ngu-chuyen-gia"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Số khoa hiển thị</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="5"
                  {...register("homepage_departments_limit")}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Ảnh trang trí lớn (cột phải)</Label>
                <Controller
                  name="homepage_departments_image_1"
                  control={control}
                  render={({ field }) => (
                    <FileUploadInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      accept="image/*"
                      label="ảnh trang trí"
                    />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ảnh trang trí nhỏ (overlay)</Label>
                <Controller
                  name="homepage_departments_image_2"
                  control={control}
                  render={({ field }) => (
                    <FileUploadInput
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      accept="image/*"
                      label="ảnh phụ"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Dynamic content sections note */}
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/50 dark:bg-zinc-800/40 p-4">
            <SectionHeader
              title="Section nội dung (Dịch vụ y khoa, Tin tức, ...)"
              description={`Mỗi danh mục được tích "Hiển thị trang chủ" sẽ tự động trở thành một section. Cấu hình tiêu đề/nhãn/mô tả/nút của section ngay trong trang Quản lý danh mục → mở danh mục đó để chỉnh.`}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Số bài mặc định mỗi section</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="4"
                  {...register("homepage_section_default_limit")}
                />
                <p className="text-xs text-muted-foreground">
                  Áp dụng khi danh mục không tự đặt giới hạn riêng.
                </p>
              </div>
            </div>
          </div>

          {/* Doctors */}
          <div className="space-y-3">
            <SectionHeader
              title='Section "Đội ngũ chuyên gia"'
              description='Bác sĩ được tích "Hiển thị trang chủ" sẽ xuất hiện ở đây.'
            />
            <SectionMetadataFields
              register={register}
              prefix="homepage_doctors_section"
              defaultButtonText="Tìm bác sĩ"
              defaultButtonUrl="/doi-ngu-chuyen-gia"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Số bác sĩ hiển thị</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="8"
                  {...register("homepage_doctors_limit")}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Quick Picker ───────────────────────────────── */}
        <TabsContent value="quickpick" className="mt-6 space-y-3">
          <SectionHeader
            title="Bật/tắt hiển thị trang chủ"
            description="Tích chọn nhanh các bài viết, danh mục, khoa, bác sĩ muốn hiển thị ngoài trang chủ. Mỗi switch sẽ lưu ngay khi đổi — không cần bấm Lưu."
          />
          <HomepageQuickPicker />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  );
}

// ── Helper components ───────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

interface SectionMetadataFieldsProps {
  register: ReturnType<typeof useForm<FormValues>>["register"];
  prefix: string;
  defaultButtonText?: string;
  defaultButtonUrl?: string;
}

function SectionMetadataFields({
  register,
  prefix,
  defaultButtonText,
  defaultButtonUrl,
}: SectionMetadataFieldsProps) {
  const k = (suffix: string) => `${prefix}_${suffix}` as keyof FormValues;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label>Nhãn (subtitle)</Label>
        <Input placeholder="VD: ĐƠN VỊ" {...register(k("subtitle") as any)} />
      </div>
      <div className="space-y-1.5">
        <Label>Tiêu đề</Label>
        <Input {...register(k("title") as any)} />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label>Mô tả</Label>
        <Textarea rows={2} {...register(k("description") as any)} />
      </div>
      <div className="space-y-1.5">
        <Label>Text nút</Label>
        <Input placeholder={defaultButtonText} {...register(k("button_text") as any)} />
      </div>
      <div className="space-y-1.5">
        <Label>URL nút</Label>
        <Input placeholder={defaultButtonUrl} {...register(k("button_url") as any)} />
      </div>
    </div>
  );
}

// ── Page export ─────────────────────────────────────────────────────────────

export default function SettingsWebsitePage() {
  return (
    <section className="rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b p-6 dark:border-zinc-800">
        <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">
          Thông tin website
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Cập nhật nội dung hiển thị công khai trên website bệnh viện.
        </p>
      </div>

      <div className="p-6">
        <SiteSettingsForm />
      </div>
    </section>
  );
}
