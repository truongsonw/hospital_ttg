import * as React from 'react';
import { IconUpload, IconX, IconPhoto, IconFile } from '@tabler/icons-react';
import { Button } from '~/components/ui/button';
import { uploadFile, getFileDownloadUrl } from '~/services/storage.service';
import { ApiError } from '~/lib/api';

interface Props {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

function isImageUrl(url: string) {
  const lower = url.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.includes(ext));
}

export default function FileUploadInput({ value, onChange, accept = '*/*', label }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const dto = await uploadFile(file);
      const url = getFileDownloadUrl(dto.id);
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload thất bại');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleClear() {
    onChange('');
    setError(null);
  }

  const hasValue = !!value;
  const isImageAccept = accept.toLowerCase().includes('image/');
  const isImage = hasValue && (isImageAccept || isImageUrl(value!));

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      {hasValue ? (
        <div className="flex items-start gap-2">
          {isImage ? (
            <img
              src={value}
              alt="preview"
              className="h-14 w-20 rounded-md border object-cover bg-muted shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="flex h-14 w-20 items-center justify-center rounded-md border bg-muted shrink-0">
              <IconFile className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{value}</p>
            <div className="flex gap-2 mt-1.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                <IconUpload className="size-3 mr-1" />
                {uploading ? 'Đang tải...' : 'Thay đổi'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleClear}
                disabled={uploading}
              >
                <IconX className="size-3 mr-1" />
                Xóa
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-dashed h-14 flex-col gap-1"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <IconPhoto className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {uploading ? 'Đang tải lên...' : `Chọn ${label ?? 'file'}`}
          </span>
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
