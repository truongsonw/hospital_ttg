import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "~/components/ui/native-select";
import { Separator } from "~/components/ui/separator";
import FileUploadInput from "~/components/shared/FileUploadInput";
import TiptapEditor from "~/components/shared/TiptapEditor";
import type { DoctorDto, DepartmentDto } from "~/types/doctor";
import { slugify } from "~/lib/utils";

const schema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên").max(200),
  slug: z.string().optional(),
  academicTitle: z.string().max(100).optional(),
  position: z.string().max(200).optional(),
  departmentId: z.string().optional(),
  specialty: z.string().max(200).optional(),
  avatarUrl: z.string().max(500).optional(),
  bio: z.string().optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  isManagement: z.boolean(),
  managementOrder: z.number().int(),
  isHomepageFeatured: z.boolean(),
});
export type FormValues = z.infer<typeof schema>;

export function DoctorForm({
  formId,
  defaultValues,
  departments,
  onSubmit,
}: {
  formId: string;
  defaultValues?: Partial<FormValues>;
  departments: DepartmentDto[];
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      academicTitle: "",
      position: "",
      departmentId: "",
      specialty: "",
      avatarUrl: "",
      bio: "",
      sortOrder: 0,
      isActive: true,
      isManagement: false,
      managementOrder: 0,
      isHomepageFeatured: false,
      ...defaultValues,
    },
  });

  const isManagement = watch("isManagement");
  const fullNameValue = watch("fullName");
  const departmentId = watch("departmentId");

  React.useEffect(() => {
    setValue("slug", slugify(fullNameValue), {
      shouldDirty: true,
    });
  }, [fullNameValue, setValue]);

  const effectiveDepartments = React.useMemo(() => {
    if (!departmentId) return departments;
    const found = departments.find((d) => d.id === departmentId);
    if (found) return departments;
    const fallback: DepartmentDto = {
      id: departmentId,
      name: "Khoa đã chọn",
      slug: "",
      sortOrder: 0,
      isActive: true,
      isHomepageFeatured: false,
      createdAt: "",
    };
    return [fallback, ...departments];
  }, [departments, departmentId]);

  const selectItems = React.useMemo(
    () =>
      [
        { value: "", label: "— Không chọn —" },
        ...effectiveDepartments.map((d) => ({ value: d.id, label: d.name })),
      ] as { value: string; label: string }[],
    [effectiveDepartments]
  );

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Họ và tên *</Label>
        <Input placeholder="Nguyễn Văn A" {...register("fullName")} />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>Slug</Label>
          <span className="text-xs text-muted-foreground">Tự động tạo từ họ tên</span>
        </div>
        <Input
          {...register("slug")}
          readOnly
          aria-readonly="true"
          placeholder="duoc-tao-tu-ho-ten"
          className="bg-muted text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Học hàm / Học vị</Label>
          <Input placeholder="PGS.TS., BSCK II..." {...register("academicTitle")} />
        </div>
        <div className="space-y-1.5">
          <Label>Chức vụ</Label>
          <Input placeholder="Trưởng khoa" {...register("position")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Khoa</Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <NativeSelect
                className="w-full"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
              >
                {selectItems.map((item) => (
                  <NativeSelectOption key={item.value || "none"} value={item.value}>
                    {item.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Chuyên khoa</Label>
          <Input placeholder="Nhi khoa, Ngoại tiêu hóa..." {...register("specialty")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Ảnh đại diện</Label>
        <Controller
          name="avatarUrl"
          control={control}
          render={({ field }) => (
            <FileUploadInput
              value={field.value ?? ""}
              onChange={field.onChange}
              accept="image/*"
              label="ảnh đại diện"
            />
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Giới thiệu</Label>
        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <TiptapEditor
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="Giới thiệu ngắn về bác sĩ..."
              minHeight={160}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Thứ tự hiển thị</Label>
          <Input type="number" {...register("sortOrder", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label>Hiển thị</Label>
          <div className="flex items-center h-10">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ban lãnh đạo</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Thuộc ban lãnh đạo</p>
            <p className="text-xs text-muted-foreground">Hiển thị trong trang Bộ máy quản lý</p>
          </div>
          <Controller
            name="isManagement"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        {isManagement && (
          <div className="space-y-1.5">
            <Label>Thứ tự trong BLĐ</Label>
            <Input type="number" placeholder="1 = Giám đốc, 2 = Phó GĐ..." {...register("managementOrder", { valueAsNumber: true })} />
          </div>
        )}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Hiển thị ở trang chủ</p>
          <p className="text-xs text-muted-foreground">
            Bác sĩ sẽ xuất hiện trong section "Đội ngũ chuyên gia".
          </p>
        </div>
        <Controller
          name="isHomepageFeatured"
          control={control}
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
      </div>
    </form>
  );
}
