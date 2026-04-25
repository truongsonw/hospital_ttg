import * as React from 'react';
import { useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { IconArrowLeft } from '@tabler/icons-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { ApiError } from '~/lib/api';
import { getAllCategoriesList } from '~/services/category.service';
import { createContent } from '~/services/content.service';
import type { CategoryDto } from '~/types/article';
import TiptapEditor from '~/components/shared/TiptapEditor';

export function meta() {
  return [{ title: 'Thêm nội dung | Hospital TTG' }];
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(1, 'Bắt buộc').max(500),
  slug: z.string().min(1, 'Bắt buộc').max(500),
  contentType: z.enum(['article', 'album', 'video']),
  categoryId: z.string().min(1, 'Bắt buộc'),
  status: z.number().int().min(0).max(1),
  isHot: z.boolean(),
  intro: z.string().optional(),
  body: z.string().optional(),
  thumbnail: z.string().optional(),
  fileAttach: z.string().optional(),
  tags: z.string().optional(),
  publishedAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ArticleContentsCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = React.useState<CategoryDto[]>([]);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      contentType: 'article',
      categoryId: '',
      status: 1,
      isHot: false,
      intro: '',
      body: '',
      thumbnail: '',
      fileAttach: '',
      tags: '',
      publishedAt: '',
    },
  });

  React.useEffect(() => {
    getAllCategoriesList().then(setCategories).catch(() => {});
  }, []);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await createContent({
        ...values,
        intro: values.intro || null,
        body: values.body || null,
        thumbnail: values.thumbnail || null,
        fileAttach: values.fileAttach || null,
        tags: values.tags || null,
        publishedAt: values.publishedAt || null,
      });
      toast.success('Tạo nội dung thành công');
      navigate('/dashboard/article/contents');
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Đã có lỗi xảy ra');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/article/contents')}>
          <IconArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold">Thêm nội dung mới</h1>
          <p className="text-sm text-muted-foreground">Bài viết, album ảnh hoặc video</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card: Thông tin cơ bản */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm p-6 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Thông tin cơ bản</h2>

          <div className="space-y-2">
            <Label>Tiêu đề *</Label>
            <Input {...register('title')} placeholder="VD: Tin tức sức khỏe mới nhất" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input {...register('slug')} placeholder="VD: tin-tuc-suc-khoe-moi-nhat" />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại nội dung *</Label>
              <select
                {...register('contentType')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="article">Bài viết</option>
                <option value="album">Album ảnh</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Danh mục *</Label>
              <select
                {...register('categoryId')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thumbnail (URL)</Label>
              <Input {...register('thumbnail')} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>File đính kèm (URL)</Label>
              <Input {...register('fileAttach')} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input {...register('tags')} placeholder="sức khỏe, y tế, ..." />
            </div>
            <div className="space-y-2">
              <Label>Ngày xuất bản</Label>
              <Input type="datetime-local" {...register('publishedAt')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <select
                {...register('status', { valueAsNumber: true })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={1}>Hiển thị</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isHot" {...register('isHot')} className="size-4" />
              <Label htmlFor="isHot">Nội dung nổi bật (Hot)</Label>
            </div>
          </div>
        </div>

        {/* Card: Giới thiệu */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm p-6 space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Giới thiệu</h2>
          <textarea
            {...register('intro')}
            rows={3}
            placeholder="Mô tả ngắn hiển thị ở trang danh sách..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          />
        </div>

        {/* Card: Nội dung chính */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800 shadow-sm p-6 space-y-3">
          <h2 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Nội dung chính</h2>
          <Controller
            name="body"
            control={control}
            render={({ field }) => (
              <TiptapEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Nhập nội dung bài viết..."
                minHeight={400}
              />
            )}
          />
        </div>

        {/* Actions */}
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <div className="flex justify-end gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/article/contents')}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Tạo nội dung'}
          </Button>
        </div>
      </form>
    </div>
  );
}
