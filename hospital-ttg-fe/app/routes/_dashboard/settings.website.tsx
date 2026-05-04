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
import FileUploadInput from "~/components/shared/FileUploadInput";
import {
  getAllSiteSettings,
  upsertSiteSettings,
  settingsToMap,
} from "~/services/site-settings.service";
import type { SiteSettingDto } from "~/types/system";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Thông tin website | Hospital TTG" }];
}

const siteSettingsSchema = z.object({
  site_name: z.string().optional(),
  site_description: z.string().optional(),
  logo_url: z.string().optional(),
  copyright: z.string().optional(),
  hotline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  working_hours: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  zalo: z.string().optional(),
  tiktok: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  google_analytics_id: z.string().optional(),
  homepage_slides_json: z.string().optional(),
  homepage_quick_actions_json: z.string().optional(),
  homepage_featured_services_subtitle: z.string().optional(),
  homepage_featured_services_title: z.string().optional(),
  homepage_featured_services_description: z.string().optional(),
  homepage_featured_news_subtitle: z.string().optional(),
  homepage_featured_news_title: z.string().optional(),
  homepage_featured_news_description: z.string().optional(),
});

type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;

const ALL_KEYS: (keyof SiteSettingsValues)[] = [
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
  "homepage_slides_json",
  "homepage_quick_actions_json",
  "homepage_featured_services_subtitle",
  "homepage_featured_services_title",
  "homepage_featured_services_description",
  "homepage_featured_news_subtitle",
  "homepage_featured_news_title",
  "homepage_featured_news_description",
];

function SiteSettingsForm() {
  const [loading, setLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty },
  } = useForm<SiteSettingsValues>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: Object.fromEntries(ALL_KEYS.map((k) => [k, ""])) as SiteSettingsValues,
  });

  React.useEffect(() => {
    getAllSiteSettings()
      .then((data: SiteSettingDto[]) => {
        const map = settingsToMap(data);
        reset(Object.fromEntries(ALL_KEYS.map((k) => [k, map[k] ?? ""])) as SiteSettingsValues);
      })
      .catch(() => toast.error("Không thể tải cài đặt website."))
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(values: SiteSettingsValues) {
    try {
      await upsertSiteSettings({
        settings: ALL_KEYS.map((k) => ({ key: k, value: values[k] ?? "" })),
      });
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section>
        <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:border-zinc-800 dark:text-zinc-300">
          Thông tin chung
        </h3>
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
                  value={field.value}
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
      </section>

      <section>
        <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:border-zinc-800 dark:text-zinc-300">
          Thông tin liên hệ
        </h3>
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
      </section>

      <section>
        <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:border-zinc-800 dark:text-zinc-300">
          Mạng xã hội
        </h3>
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
      </section>

      <section>
        <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:border-zinc-800 dark:text-zinc-300">
          SEO
        </h3>
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
      </section>

      <section>
        <h3 className="mb-4 border-b pb-2 text-sm font-semibold text-gray-700 dark:border-zinc-800 dark:text-zinc-300">
          Trang chủ
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="homepage_featured_services_subtitle">Nhãn dịch vụ</Label>
            <Input id="homepage_featured_services_subtitle" placeholder="ĐƠN VỊ" {...register("homepage_featured_services_subtitle")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="homepage_featured_services_title">Tiêu đề dịch vụ</Label>
            <Input id="homepage_featured_services_title" placeholder="Dịch vụ y khoa" {...register("homepage_featured_services_title")} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="homepage_featured_services_description">Mô tả dịch vụ</Label>
            <Textarea
              id="homepage_featured_services_description"
              rows={2}
              placeholder="Chăm sóc sức khỏe toàn diện cho gia đình bạn"
              {...register("homepage_featured_services_description")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="homepage_featured_news_subtitle">Nhãn tin tức</Label>
            <Input id="homepage_featured_news_subtitle" placeholder="TIN TỨC" {...register("homepage_featured_news_subtitle")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="homepage_featured_news_title">Tiêu đề tin tức</Label>
            <Input id="homepage_featured_news_title" placeholder="Tin tức nổi bật" {...register("homepage_featured_news_title")} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="homepage_featured_news_description">Mô tả tin tức</Label>
            <Textarea
              id="homepage_featured_news_description"
              rows={2}
              placeholder="Cập nhật thông tin y tế và hoạt động mới nhất của bệnh viện"
              {...register("homepage_featured_news_description")}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="homepage_slides_json">Banner trang chủ (JSON)</Label>
            <Textarea
              id="homepage_slides_json"
              rows={8}
              placeholder='[{"imageUrl":"/images/banner/Ngoai.png","altText":"Bệnh viện TTG","sortOrder":1,"isActive":true}]'
              className="font-mono text-xs"
              {...register("homepage_slides_json")}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="homepage_quick_actions_json">Quick actions trang chủ (JSON)</Label>
            <Textarea
              id="homepage_quick_actions_json"
              rows={10}
              placeholder='[{"key":"booking","title":"Đặt lịch khám","kind":"booking","sortOrder":2,"isActive":true}]'
              className="font-mono text-xs"
              {...register("homepage_quick_actions_json")}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  );
}

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
        <div className="max-w-3xl">
          <SiteSettingsForm />
        </div>
      </div>
    </section>
  );
}
