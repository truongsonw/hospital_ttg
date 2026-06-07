import * as React from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Route } from "./+types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/context/auth.context";
import { ApiError } from "~/lib/api";
import { updateMe } from "~/services/auth.service";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Hồ sơ cá nhân | Hospital TTG" }];
}

const profileSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống").max(200),
  email: z.string().email("Email không hợp lệ"),
});

type ProfileValues = z.infer<typeof profileSchema>;

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

export default function ProfilePage() {
  const { user, refreshUser, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Profile form state
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = React.useState(false);

  // Password form state
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = React.useState(false);

  // Profile form
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
    },
  });

  React.useEffect(() => {
    if (user) {
      profileForm.reset({ fullName: user.fullName, email: user.email });
    }
  }, [user, profileForm]);

  async function handleProfileSubmit(values: ProfileValues) {
    setProfileError(null);
    setIsSubmittingProfile(true);
    try {
      await updateMe({ fullName: values.fullName, email: values.email });
      toast.success("Cập nhật hồ sơ thành công.");
      await refreshUser();
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setIsSubmittingProfile(false);
    }
  }

  // Password form
  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function handlePasswordSubmit(values: ChangePasswordValues) {
    setPasswordError(null);
    setIsSubmittingPassword(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      passwordForm.reset();
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : "Đã có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmittingPassword(false);
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm">
      <Tabs defaultValue="profile" className="w-full">
        <div className="px-6 pt-4">
          <TabsList variant="line">
            <TabsTrigger value="profile">Hồ sơ cá nhân</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Hồ sơ cá nhân */}
        <TabsContent value="profile" className="px-6 pb-6 pt-2">
          <form className="max-w-xl space-y-6" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                {...profileForm.register("fullName")}
                placeholder="Nhập họ và tên của bạn"
              />
              {profileForm.formState.errors.fullName && (
                <p className="text-sm text-destructive">
                  {String(profileForm.formState.errors.fullName.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...profileForm.register("email")}
                placeholder="Nhập địa chỉ email"
              />
              {profileForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {String(profileForm.formState.errors.email.message)}
                </p>
              )}
            </div>

            {profileError && (
              <p className="text-sm text-destructive">{profileError}</p>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isSubmittingProfile || !profileForm.formState.isDirty}
              >
                {isSubmittingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (user) profileForm.reset({ fullName: user.fullName, email: user.email });
                }}
                disabled={isSubmittingProfile || !profileForm.formState.isDirty}
              >
                Hủy
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab: Bảo mật */}
        <TabsContent value="security" className="px-6 pb-6 pt-2">
          <form className="max-w-xl space-y-4" onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {String(passwordForm.formState.errors.currentPassword.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {String(passwordForm.formState.errors.newPassword.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                {...passwordForm.register("confirmNewPassword")}
              />
              {passwordForm.formState.errors.confirmNewPassword && (
                <p className="text-sm text-destructive">
                  {String(passwordForm.formState.errors.confirmNewPassword.message)}
                </p>
              )}
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmittingPassword}>
                {isSubmittingPassword ? "Đang lưu..." : "Đổi mật khẩu"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPasswordError(null);
                  passwordForm.reset();
                }}
                disabled={isSubmittingPassword}
              >
                Hủy
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
