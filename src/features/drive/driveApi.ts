import { api } from '@/lib/api'

import type {
  FolderContentsResponse,
  FolderRead,
  PaginatedFolderResponse,
  ResourceDownloadInfo,
  ResourceRead,
} from './types'

export const PAGE_SIZE = 50

export const driveApi = {
  // Root folders (parent_folder_id = null)
  rootFolders: (page = 1, limit = PAGE_SIZE) =>
    api
      .get<PaginatedFolderResponse>('/folders', { params: { page, limit, sort_by: 'name' } })
      .then((r) => r.data),

  folderContents: (folderId: string, page = 1, limit = PAGE_SIZE) =>
    api
      .get<FolderContentsResponse>(`/folders/${folderId}/contents`, {
        params: { page, limit, sort_by: 'name' },
      })
      .then((r) => r.data),

  // All resources accessible to the user (used to derive root-level files)
  listResources: (offset = 0, limit = PAGE_SIZE) =>
    api.get<ResourceRead[]>('/resources', { params: { limit, offset } }).then((r) => r.data),

  sharedWithMe: (offset = 0, limit = PAGE_SIZE) =>
    api
      .get<ResourceRead[]>('/resources/shared-with-me', { params: { limit, offset } })
      .then((r) => r.data),

  sharedByMe: (offset = 0, limit = PAGE_SIZE) =>
    api
      .get<ResourceRead[]>('/resources/shared-by-me', { params: { limit, offset } })
      .then((r) => r.data),

  // Verified teacher/department notes = approved, institutionally-visible resources.
  teacherNotes: (offset = 0, limit = PAGE_SIZE) =>
    api
      .get<ResourceRead[]>('/resources', {
        params: { status: 'APPROVED', limit, offset, sort_by: 'created_at', order: 'desc' },
      })
      .then((r) => r.data),

  // Folders explicitly shared with me (browsable subtrees).
  sharedFoldersWithMe: (offset = 0, limit = PAGE_SIZE) =>
    api
      .get<FolderRead[]>('/folders/shared-with-me', { params: { limit, offset } })
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
