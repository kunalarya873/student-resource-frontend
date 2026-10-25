import { api } from '@/lib/api'
import type { ResourceRead } from '@/features/drive/types'

interface InitiateResponse {
  reservation_id: string
  upload_url: string
  object_key: string
  expires_at: string
  reserved_bytes: number
}

export const uploadsApi = {
  initiate: (filename: string, contentType: string, sizeBytes: number) =>
    api
      .post<InitiateResponse>('/uploads/initiate', {
        filename,
        content_type: contentType,
        size_bytes: sizeBytes,
      })
      .then((r) => r.data),

  complete: (reservationId: string) =>
    api
      .post('/uploads/complete', { reservation_id: reservationId })
      .then((r) => r.data),

  register: (reservationId: string, folderId: string | null, title: string) =>
    api
      .post<ResourceRead>('/resources', {
        reservation_id: reservationId,
        folder_id: folderId,
        title,
      })
      .then((r) => r.data),

  cancel: (reservationId: string) =>
    api.post(`/uploads/${reservationId}/cancel`).then((r) => r.data),

  uploadDirect: (
    file: File,
    folderId: string | null,
    onProgress: (percent: number) => void,
    signal?: AbortSignal,
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    if (folderId) formData.append('folder_id', folderId)

    return api
      .post<ResourceRead>('/resources/upload', formData, {
        signal,
        onUploadProgress: (e) => {
          if (e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      .then((r) => r.data)
  },
}

/**
 * Direct PUT of the file to the presigned storage URL, reporting 0–100 progress.
 * The Content-Type must match what was sent to /initiate — the presign signs it.
 */
export function putFileWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Storage rejected the upload (HTTP ${xhr.status}).`))
    }
    xhr.onerror = () =>
      reject(new Error('Could not reach storage. Check the storage service CORS settings.'))
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))

    if (signal) {
      if (signal.aborted) {
        xhr.abort()
        return
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    xhr.send(file)
  })
}
