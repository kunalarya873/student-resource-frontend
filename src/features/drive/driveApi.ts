import { api } from '@/lib/api'

import type {
  FolderContentsResponse,
  PaginatedFolderResponse,
  ResourceDownloadInfo,
  ResourceRead,
} from './types'

export const driveApi = {
  // Root folders (parent_folder_id = null)
  rootFolders: () =>
    api
      .get<PaginatedFolderResponse>('/folders', { params: { limit: 100, sort_by: 'name' } })
      .then((r) => r.data),

  folderContents: (folderId: string) =>
    api
      .get<FolderContentsResponse>(`/folders/${folderId}/contents`, {
        params: { limit: 100, sort_by: 'name' },
      })
      .then((r) => r.data),

  // All resources accessible to the user (used to derive root-level files)
  listResources: () =>
    api.get<ResourceRead[]>('/resources', { params: { limit: 100 } }).then((r) => r.data),

  sharedWithMe: () =>
    api
      .get<ResourceRead[]>('/resources/shared-with-me', { params: { limit: 100 } })
      .then((r) => r.data),

  sharedByMe: () =>
    api
      .get<ResourceRead[]>('/resources/shared-by-me', { params: { limit: 100 } })
      .then((r) => r.data),

  downloadInfo: (resourceId: string, inline = false) =>
    api
      .get<ResourceDownloadInfo>(`/resources/${resourceId}/download`, { params: { inline } })
      .then((r) => r.data),

  moveResource: (resourceId: string, folderId: string | null) =>
    api.patch(`/resources/${resourceId}`, { folder_id: folderId }).then((r) => r.data),

  moveFolder: (folderId: string, parentFolderId: string | null) =>
    api.patch(`/folders/${folderId}`, { parent_folder_id: parentFolderId }).then((r) => r.data),

  createFolder: (name: string, parentFolderId: string | null) =>
    api.post('/folders', { name, parent_folder_id: parentFolderId }).then((r) => r.data),

  renameFolder: (folderId: string, name: string) =>
    api.patch(`/folders/${folderId}`, { name }).then((r) => r.data),

  renameResource: (resourceId: string, title: string) =>
    api.patch(`/resources/${resourceId}`, { title }).then((r) => r.data),

  deleteFolder: (folderId: string) =>
    api.delete(`/folders/${folderId}`, { params: { recursive: true } }).then((r) => r.data),

  deleteResource: (resourceId: string) =>
    api.delete(`/resources/${resourceId}`).then((r) => r.data),
}
