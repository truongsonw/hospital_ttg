import { apiUpload, BASE_URL } from '~/lib/api';

export interface FileDto {
  id: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
  createdBy: string | null;
}

export async function uploadFile(file: File): Promise<FileDto> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiUpload<FileDto>('/api/storage', formData);
  return res.data!;
}

export function getFileDownloadUrl(fileId: string): string {
  return `${BASE_URL}/api/storage/${fileId}/download`;
}
