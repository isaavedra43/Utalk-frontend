import { api } from '$lib/services/axios';

export type UploadProgressCallback = (percent: number) => void;

export interface UploadResult {
    fileId?: string;
    mediaUrl: string;
    mimeType: string;
    fileName: string;
    fileSize: number;
    thumbnailUrl?: string;
    durationMs?: number;
}

export interface UploadOptions {
    signal?: AbortSignal;
    onProgress?: UploadProgressCallback;
}

export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ success: boolean; data: { id?: string; url: string; mimeType: string; size: number; filename?: string; thumbnailUrl?: string } }>(
        '/media/upload',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            signal: options.signal,
            onUploadProgress: (event) => {
                if (!options.onProgress || !event.total) return;
                const percent = Math.round((event.loaded * 100) / event.total);
                options.onProgress(percent);
            }
        }
    );

    const data = response.data.data;

    return {
        fileId: data.id,
        mediaUrl: data.url,
        mimeType: data.mimeType || file.type,
        fileName: data.filename || file.name,
        fileSize: data.size,
        thumbnailUrl: data.thumbnailUrl
    };
} 