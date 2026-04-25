import * as React from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/context/auth.context";
import { ApiError } from "~/lib/api";

const schema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await login(values.username, values.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Đã có lỗi xảy ra, vui lòng thử lại.");
      }
    }
  }

  return (
    <div className="w-full max-w-[380px] p-6 mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">Đăng nhập</h2>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input
            id="username"
            autoComplete="username"
            placeholder="Nhập tên đăng nhập"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-destructive">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive text-center">{serverError}</p>
        )}

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </div>
      </form>
    </div>
  );
}
