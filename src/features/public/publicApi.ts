import { api } from '@/lib/api'
import type { FolderRead, FolderResourceItem, RawBreadcrumb } from '@/features/drive/types'

export interface PublicShareItemResponse {
  kind: 'folder' | 'resource'
  share_token: string
  name: string
  owner_name: string
  created_at: string
  size_bytes?: number | null
  content_type?: string | null
}

export interface PublicFolderRead {
  folder_id: string
  name: string
  owner_name: string
  created_at: string
  share_token: string
  is_public: boolean
}

export interface PublicFolderContentsResponse {
  folder: PublicFolderRead
  breadcrumbs: RawBreadcrumb[]
  subfolders: FolderRead[]
  resources: FolderResourceItem[]
  page: number
  limit: number
  total_subfolders: number
  total_resources: number
}

export interface PublicResourceRead {
  resource_id: string
  title: string
  description?: string | null
  content_type?: string | null
  size_bytes: number
  is_external: boolean
  external_url?: string | null
  owner_name: string
  created_at: string
  share_token: string
  is_public: boolean
}

export interface PublicResourceDownloadResponse {
  download_url: string
  filename: string
  content_type: string
  size_bytes: number
  is_external: boolean
}

export interface PublicJoinResponse {
  message: string
  kind: 'folder' | 'resource'
  item_id: string
  already_member: boolean
}

export const publicApi = {
  resolve: (shareToken: string) =>
    api.get<PublicShareItemResponse>(`/public/s/${shareToken}`).then((r) => r.data),

  folderContents: (
    shareToken: string,
    params?: {
      subfolder_id?: string | null
      q?: string
      page?: number
      limit?: number
      sort_by?: string
      order?: string
    },
  ) =>
    api
      .get<PublicFolderContentsResponse>(`/public/folders/${shareToken}`, {
        params: {
          subfolder_id: params?.subfolder_id || undefined,
          q: params?.q || undefined,
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          sort_by: params?.sort_by ?? 'name',
          order: params?.order ?? 'asc',
        },
      })
      .then((r) => r.data),

  resourceDetails: (shareToken: string) =>
    api.get<PublicResourceRead>(`/public/resources/${shareToken}`).then((r) => r.data),

  downloadInfo: (shareToken: string, inline = false) =>
    api
      .get<PublicResourceDownloadResponse>(`/public/resources/${shareToken}/download`, {
        params: { inline },
      })
      .then((r) => r.data),

  join: (shareToken: string) =>
    api.post<PublicJoinResponse>(`/public/s/${shareToken}/join`).then((r) => r.data),
}
