import * as React from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Route } from "./+types/settings";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAuth } from "~/context/auth.context";
import { ApiError } from "~/lib/api";
import {
  getAllSiteSettings,
  upsertSiteSettings,
  settingsToMap,
} from "~/services/site-settings.service";
import type { SiteSettingDto } from "~/types/system";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Cài đặt | Hospital TTG" }];
}

// ─── Change Password ───────────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmNewPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

function ChangePasswordDialog() {
  const { changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordValues) {
    setServerError(null);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      setOpen(false);
      reset();
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Đã có lỗi xảy ra, vui lòng thử lại.");
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          reset();
          setServerError(null);
        }
      }}
    >
      <Button variant="outline" onClick={() => setOpen(true)}>
        Đổi mật khẩu
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmNewPassword")}
            />
            {errors.confirmNewPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>
          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Site Settings Form ────────────────────────────────────────────────────────

const siteSettingsSchema = z.object({
  // general
  site_name: z.string().optional(),
  site_description: z.string().optional(),
  logo_url: z.string().optional(),
  copyright: z.string().optional(),
  // contact
  hotline: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  working_hours: z.string().optional(),
  // social
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  zalo: z.string().optional(),
  tiktok: z.string().optional(),
  // seo
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  google_analytics_id: z.string().optional(),
});

type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;

const ALL_KEYS: (keyof SiteSettingsValues)[] = [
  "site_name", "site_description", "logo_url", "copyright",
  "hotline", "phone", "email", "address", "working_hours",
  "facebook", "youtube", "zalo", "tiktok",
  "meta_title", "meta_description", "google_analytics_id",
];

function SiteSettingsForm() {
  const [loading, setLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
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
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        Đang tải...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Thông tin chung */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4 pb-2 border-b dark:border-zinc-800">
          Thông tin chung
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="site_name">Tên bệnh viện</Label>
            <Input id="site_name" placeholder="Bệnh viện TTG" {...register("site_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logo_url">URL Logo</Label>
            <Input id="logo_url" placeholder="https://..." {...register("logo_url")} />
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

      {/* Liên hệ */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4 pb-2 border-b dark:border-zinc-800">
          Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Input id="working_hours" placeholder="Thứ 2 – Thứ 7: 7:00 – 17:00" {...register("working_hours")} />
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

      {/* Mạng xã hội */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4 pb-2 border-b dark:border-zinc-800">
          Mạng xã hội
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* SEO */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-4 pb-2 border-b dark:border-zinc-800">
          SEO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="meta_title">Meta Title mặc định</Label>
            <Input id="meta_title" placeholder="Bệnh viện TTG – Chăm sóc sức khỏe toàn diện" {...register("meta_title")} />
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

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      <div className="p-6 border-b dark:border-zinc-800">
        <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">
          Cài đặt hệ thống
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý tài khoản và thông tin chung của website.
        </p>
      </div>

      <div className="p-6">
        <Tabs defaultValue="account">
          <TabsList className="mb-6">
            <TabsTrigger value="account">Tài khoản</TabsTrigger>
            <TabsTrigger value="website">Thông tin website</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="max-w-xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  defaultValue={user?.fullName ?? ""}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  defaultValue={user?.email ?? ""}
                  readOnly
                />
              </div>
              <ChangePasswordDialog />
            </div>
          </TabsContent>

          <TabsContent value="website">
            <div className="max-w-3xl">
              <SiteSettingsForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
