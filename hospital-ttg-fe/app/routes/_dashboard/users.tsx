import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegister, type UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Pagination from "~/components/shared/Pagination";
import { ApiError } from "~/lib/api";
import {
  createUser,
  getPagedUsers,
  getRoles,
  resetUserPassword,
  updateUser,
  updateUserStatus,
} from "~/services/user.service";
import type {
  CreateUserRequest,
  RoleDto,
  UpdateUserRequest,
  UserListItemDto,
} from "~/types/auth";

export function meta() {
  return [{ title: "Quản lý người dùng | Hospital TTG" }];
}

const PAGE_SIZE = 10;

const createUserSchema = z.object({
  username: z.string().trim().min(3, "Tên đăng nhập tối thiểu 3 ký tự").max(100, "Tên đăng nhập tối đa 100 ký tự"),
  email: z.email("Email không hợp lệ").max(256, "Email tối đa 256 ký tự"),
  fullName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(200, "Họ tên tối đa 200 ký tự"),
  role: z.string().trim().min(1, "Vui lòng chọn vai trò"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  isActive: z.boolean(),
});

const updateUserSchema = z
  .object({
    email: z.email("Email không hợp lệ").max(256, "Email tối đa 256 ký tự"),
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(200, "Họ tên tối đa 200 ký tự"),
    role: z.string().trim().min(1, "Vui lòng chọn vai trò"),
    isActive: z.boolean(),
    password: z
      .string()
      .max(256)
      .optional()
      .refine((value) => value === undefined || value === "" || value.length >= 8, {
        message: "Mật khẩu tối thiểu 8 ký tự",
      }),
    confirmPassword: z.string().max(256).optional(),
  })
  .refine(
    (data) => {
      // If a new password is being set, the confirmation must match and be present.
      if (data.password && data.password.length > 0) {
        return data.confirmPassword === data.password;
      }
      return true;
    },
    { message: "Mật khẩu xác nhận không khớp", path: ["confirmPassword"] },
  );

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(8, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type CreateUserValues = z.infer<typeof createUserSchema>;
type UpdateUserValues = z.infer<typeof updateUserSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

type UserFormErrors = Partial<Record<"username" | "email" | "fullName" | "role" | "password" | "confirmPassword", string | undefined>>;

const SERVER_FIELD_MAP = {
  Username: "username",
  Email: "email",
  FullName: "fullName",
  Role: "role",
  Password: "password",
  NewPassword: "newPassword",
  ConfirmPassword: "confirmPassword",
} as const;

type ServerFieldKey = keyof typeof SERVER_FIELD_MAP;

function pickFirstMessage(messages: string[] | undefined): string | undefined {
  if (!Array.isArray(messages) || messages.length === 0) return undefined;
  return messages[0];
}

function applyServerErrors(
  setError: UseFormSetError<Record<string, unknown>>,
  fieldErrors: Record<string, string[]> | undefined,
  allowedFields: ReadonlyArray<keyof typeof SERVER_FIELD_MAP>,
) {
  if (!fieldErrors) return false;
  let applied = false;
  for (const [rawKey, messages] of Object.entries(fieldErrors)) {
    const formKey = SERVER_FIELD_MAP[rawKey as ServerFieldKey];
    if (!formKey || !allowedFields.includes(rawKey as ServerFieldKey)) continue;
    const message = pickFirstMessage(messages);
    if (!message) continue;
    setError(formKey as never, { type: "server", message });
    applied = true;
  }
  return applied;
}

function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Đang hoạt động" : "Đã khóa"}
    </Badge>
  );
}

function CreateUserFormFields({
  register,
  errors,
  roles,
  roleValue,
  onRoleChange,
  isActive,
  onActiveChange,
}: {
  register: UseFormRegister<CreateUserValues>;
  errors: UserFormErrors;
  roles: RoleDto[];
  roleValue: string;
  onRoleChange: (value: string | null) => void;
  isActive: boolean;
  onActiveChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <Input id="username" {...register("username")} autoComplete="username" />
        {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input id="fullName" {...register("fullName")} autoComplete="name" />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} autoComplete="email" />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Vai trò</Label>
        <select
          id="role"
          value={roleValue}
          onChange={(event) => onRoleChange(event.target.value || null)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Chọn vai trò</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" type="password" {...register("password")} autoComplete="new-password" />
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Kích hoạt tài khoản</p>
          <p className="text-xs text-muted-foreground">Người dùng bị khóa sẽ không thể đăng nhập hoặc làm mới phiên.</p>
        </div>
        <Switch checked={isActive} onCheckedChange={onActiveChange} aria-label="Kích hoạt tài khoản" />
      </div>
    </div>
  );
}

function EditUserFormFields({
  register,
  errors,
  roles,
  roleValue,
  onRoleChange,
  isActive,
  onActiveChange,
}: {
  register: UseFormRegister<UpdateUserValues>;
  errors: UserFormErrors;
  roles: RoleDto[];
  roleValue: string;
  onRoleChange: (value: string | null) => void;
  isActive: boolean;
  onActiveChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input id="fullName" {...register("fullName")} autoComplete="name" />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} autoComplete="email" />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-role">Vai trò</Label>
        <select
          id="edit-role"
          value={roleValue}
          onChange={(event) => onRoleChange(event.target.value || null)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Chọn vai trò</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
      </div>

      <div className="space-y-2 rounded-lg border bg-muted/20 px-4 py-3">
        <p className="text-sm font-medium">Đổi mật khẩu</p>
        <p className="text-xs text-muted-foreground">
          Để trống nếu muốn giữ nguyên mật khẩu hiện tại. Khi nhập mật khẩu mới, người dùng sẽ phải đăng nhập lại ở phiên kế tiếp.
        </p>
        <div className="space-y-2 pt-1">
          <Label htmlFor="edit-password">Mật khẩu mới</Label>
          <Input
            id="edit-password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-confirmPassword">Xác nhận mật khẩu mới</Label>
          <Input
            id="edit-confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Kích hoạt tài khoản</p>
          <p className="text-xs text-muted-foreground">Người dùng bị khóa sẽ không thể đăng nhập hoặc làm mới phiên.</p>
        </div>
        <Switch checked={isActive} onCheckedChange={onActiveChange} aria-label="Kích hoạt tài khoản" />
      </div>
    </div>
  );
}

function UserFormShell({
  title,
  description,
  open,
  onOpenChange,
  children,
  footer,
}: {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="w-full sm:w-[560px] sm:max-w-[95vw]">
      <DrawerContent>
        <DrawerHeader className="px-6 py-4">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          <DrawerFooter className="px-6 py-4">{footer}</DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CreateUserDrawer({
  open,
  onOpenChange,
  roles,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  roles: RoleDto[];
  onSuccess: (created: UserListItemDto) => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      role: "",
      password: "",
      isActive: true,
    },
  });

  const roleValue = watch("role");
  const isActive = watch("isActive");

  async function onSubmit(values: CreateUserValues) {
    setServerError(null);
    try {
      const payload: CreateUserRequest = values;
      const created = await createUser(payload);
      toast.success("Tạo người dùng thành công.");
      onSuccess({
        id: created.id,
        username: created.username,
        email: created.email,
        fullName: created.fullName,
        role: created.role,
        isActive: created.isActive,
        createdAt: created.createdAt,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        const applied = applyServerErrors(
          setError as UseFormSetError<Record<string, unknown>>,
          error.errors,
          ["Username", "Email", "FullName", "Role", "Password"],
        );
        setServerError(applied ? null : error.message);
      } else {
        setServerError("Không thể tạo người dùng.");
      }
    }
  }

  return (
    <UserFormShell
      title="Thêm người dùng mới"
      description="Tạo tài khoản nội bộ, gán vai trò và thiết lập trạng thái đăng nhập ngay từ lúc khởi tạo."
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) {
          reset();
          setServerError(null);
        }
      }}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="create-user-form" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Tạo người dùng"}
          </Button>
        </>
      }
    >
      <form id="create-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CreateUserFormFields
          register={register}
          errors={{
            username: errors.username?.message,
            email: errors.email?.message,
            fullName: errors.fullName?.message,
            role: errors.role?.message,
            password: errors.password?.message,
          }}
          roles={roles}
          roleValue={roleValue}
          onRoleChange={(value) => setValue("role", value ?? "", { shouldDirty: true, shouldValidate: true })}
          isActive={isActive}
          onActiveChange={(value) => setValue("isActive", value, { shouldDirty: true, shouldValidate: true })}
        />
        {serverError && <p className="text-sm text-destructive whitespace-pre-line">{serverError}</p>}
      </form>
    </UserFormShell>
  );
}

function EditUserDrawer({
  user,
  roles,
  open,
  onOpenChange,
  onSuccess,
}: {
  user: UserListItemDto | null;
  roles: RoleDto[];
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSuccess: (updated: UserListItemDto) => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "",
      isActive: true,
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (!user) return;
    reset({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      password: "",
      confirmPassword: "",
    });
    setServerError(null);
  }, [user, reset]);

  const roleValue = watch("role");
  const isActive = watch("isActive");

  async function onSubmit(values: UpdateUserValues) {
    if (!user) return;
    setServerError(null);
    try {
      const trimmedPassword = values.password?.trim() ?? "";
      const payload: UpdateUserRequest = {
        email: values.email,
        fullName: values.fullName,
        role: values.role,
        isActive: values.isActive,
        // Only send password when the admin actually entered a new one.
        ...(trimmedPassword ? { password: trimmedPassword } : {}),
      };
      const updated = await updateUser(user.id, payload);
      toast.success("Cập nhật người dùng thành công.");
      onSuccess({
        id: updated.id,
        username: updated.username,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
      });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError) {
        const applied = applyServerErrors(
          setError as UseFormSetError<Record<string, unknown>>,
          error.errors,
          ["Email", "FullName", "Role", "Password"],
        );
        setServerError(applied ? null : error.message);
      } else {
        setServerError("Không thể cập nhật người dùng.");
      }
    }
  }

  return (
    <UserFormShell
      title="Chỉnh sửa người dùng"
      description="Cập nhật thông tin liên hệ, vai trò và quyền truy cập của tài khoản nội bộ."
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) {
          setServerError(null);
        }
      }}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="edit-user-form" disabled={isSubmitting || !user}>
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </>
      }
    >
      {user && (
        <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium">Tên đăng nhập</p>
            <p className="text-muted-foreground break-all">{user.username}</p>
          </div>
          <EditUserFormFields
            register={register}
            errors={{
              email: errors.email?.message,
              fullName: errors.fullName?.message,
              role: errors.role?.message,
              password: errors.password?.message,
              confirmPassword: errors.confirmPassword?.message,
            }}
            roles={roles}
            roleValue={roleValue}
            onRoleChange={(value) => setValue("role", value ?? "", { shouldDirty: true, shouldValidate: true })}
            isActive={isActive}
            onActiveChange={(value) => setValue("isActive", value, { shouldDirty: true, shouldValidate: true })}
          />
          {serverError && <p className="text-sm text-destructive whitespace-pre-line">{serverError}</p>}
        </form>
      )}
    </UserFormShell>
  );
}

function ResetPasswordDrawer({
  user,
  open,
  onOpenChange,
}: {
  user: UserListItemDto | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    if (!user) return;
    setServerError(null);
    try {
      await resetUserPassword(user.id, { newPassword: values.newPassword });
      toast.success("Đặt lại mật khẩu thành công.");
      onOpenChange(false);
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        const applied = applyServerErrors(
          setError as UseFormSetError<Record<string, unknown>>,
          error.errors,
          ["NewPassword", "ConfirmPassword"],
        );
        setServerError(applied ? null : error.message);
      } else {
        setServerError("Không thể đặt lại mật khẩu.");
      }
    }
  }

  return (
    <UserFormShell
      title="Đặt lại mật khẩu"
      description="Tạo mật khẩu mới cho tài khoản nội bộ. Hãy gửi lại thông tin đăng nhập cho người dùng qua kênh an toàn."
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) {
          reset();
          setServerError(null);
        }
      }}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" form="reset-password-form" disabled={isSubmitting || !user}>
            {isSubmitting ? "Đang lưu..." : "Xác nhận"}
          </Button>
        </>
      }
    >
      {user && (
        <form id="reset-password-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium">Người dùng</p>
            <p className="text-muted-foreground break-words">{user.fullName} ({user.username})</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
            {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          {serverError && <p className="text-sm text-destructive whitespace-pre-line">{serverError}</p>}
        </form>
      )}
    </UserFormShell>
  );
}

export default function UsersPage() {
  const [items, setItems] = React.useState<UserListItemDto[]>([]);
  const [roles, setRoles] = React.useState<RoleDto[]>([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"" | "true" | "false">("");
  const [loading, setLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<UserListItemDto | null>(null);
  const [resetPasswordTarget, setResetPasswordTarget] = React.useState<UserListItemDto | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPagedUsers({
        keyword: search || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === "" ? "" : statusFilter === "true",
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(res.data ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      toast.error("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search, statusFilter]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    getRoles()
      .then((data) => setRoles(data.filter((role) => role.isActive)))
      .catch(() => toast.error("Không thể tải danh sách vai trò."));
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  async function handleToggleStatus(user: UserListItemDto, nextIsActive: boolean) {
    setStatusUpdatingId(user.id);
    try {
      await updateUserStatus(user.id, { isActive: nextIsActive });
      setItems((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, isActive: nextIsActive } : item)),
      );
      toast.success(nextIsActive ? "Đã kích hoạt tài khoản." : "Đã khóa tài khoản.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Không thể cập nhật trạng thái.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  function handleCreateSuccess(created: UserListItemDto) {
    setItems((prev) => [created, ...prev]);
  }

  function handleUpdateSuccess(updated: UserListItemDto) {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b p-6 dark:border-zinc-800">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Quản lý người dùng</h2>
          <p className="mt-0.5 text-sm text-gray-500">Quản trị tài khoản nội bộ, vai trò dữ liệu và trạng thái hoạt động.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 border-b p-4 dark:border-zinc-800">
        <form onSubmit={handleSearchSubmit} className="flex min-w-48 flex-1 gap-2">
          <Input
            placeholder="Tìm theo tên đăng nhập, email, họ tên..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="outline" size="sm">
            Tìm
          </Button>
        </form>

        <Select
          value={roleFilter || "all"}
          onValueChange={(value) => {
            if (!value || value === "all") {
              setRoleFilter("");
            } else {
              setRoleFilter(value);
            }
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tất cả vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            setStatusFilter(value === "all" ? "" : (value as "true" | "false"));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="true">Đang hoạt động</SelectItem>
            <SelectItem value="false">Đã khóa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-400">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-gray-400">
                  Chưa có người dùng phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="max-w-0">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium">{user.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-0">
                    <p className="truncate">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserStatusBadge isActive={user.isActive} />
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={(checked) => handleToggleStatus(user, checked)}
                        disabled={statusUpdatingId === user.id}
                        aria-label={`Chuyển trạng thái ${user.username}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditTarget(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setResetPasswordTarget(user)}>
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center border-t p-4 dark:border-zinc-800">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <CreateUserDrawer open={createOpen} onOpenChange={setCreateOpen} roles={roles} onSuccess={handleCreateSuccess} />
      <EditUserDrawer user={editTarget} roles={roles} open={!!editTarget} onOpenChange={(value) => !value && setEditTarget(null)} onSuccess={handleUpdateSuccess} />
      <ResetPasswordDrawer user={resetPasswordTarget} open={!!resetPasswordTarget} onOpenChange={(value) => !value && setResetPasswordTarget(null)} />
    </div>
  );
}
