// Normalized shapes the UI renders, decoupled from the three different
// resource payloads the backend returns (folder contents, /resources, shared).

export interface DriveFolder {
  kind: 'folder'
  folderId: string
  name: string
  updatedAt: string
}

export interface DriveResource {
  kind: 'resource'
  resourceId: string
  title: string
  description: string | null
  visibility: string
  status: string
  createdAt: string
  contentType: string | null
  sizeBytes: number | null
  isExternal: boolean
}

export interface Breadcrumb {
  folderId: string
  name: string
}

export interface ResourceDownloadInfo {
  resource_id: string
  version_id: string
  version_number: number
  is_external: boolean
  download_url: string
  filename: string
  content_type: string
  size_bytes: number
}

// --- Raw backend shapes --------------------------------------------------
export interface FolderRead {
  folder_id: string
  owner_id: string
  parent_folder_id: string | null
  name: string
  created_at: string
  updated_at: string
}

export interface FolderResourceItem {
  resource_id: string
  owner_id: string
  title: string
  description: string | null
  visibility: string
  status: string
  created_at: string
}

export interface ResourceVersion {
  version_id: string
  content_type: string
  external_url: string | null
  size_bytes: number
  version_number: number
}

export interface ResourceRead {
  resource_id: string
  owner_id: string
  folder_id: string | null
  title: string
  description: string | null
  visibility: string
  status: string
  created_at: string
  updated_at: string
  current_version: ResourceVersion | null
}

export interface PaginatedFolderResponse {
  items: FolderRead[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface RawBreadcrumb {
  folder_id: string
  name: string
}

export interface FolderContentsResponse {
  folder: FolderRead
  breadcrumbs: RawBreadcrumb[]
  subfolders: FolderRead[]
  resources: FolderResourceItem[]
  total_subfolders: number
  total_resources: number
}

// --- Normalizers ---------------------------------------------------------
export function toFolder(f: FolderRead): DriveFolder {
  return { kind: 'folder', folderId: f.folder_id, name: f.name, updatedAt: f.updated_at }
}

export function toBreadcrumb(b: RawBreadcrumb): Breadcrumb {
  return { folderId: b.folder_id, name: b.name }
}

export function fromFolderResource(r: FolderResourceItem): DriveResource {
  return {
    kind: 'resource',
    resourceId: r.resource_id,
    title: r.title,
    description: r.description,
    visibility: r.visibility,
    status: r.status,
    createdAt: r.created_at,
    contentType: null,
    sizeBytes: null,
    isExternal: false,
  }
}

export function fromResource(r: ResourceRead): DriveResource {
  return {
    kind: 'resource',
    resourceId: r.resource_id,
    title: r.title,
    description: r.description,
    visibility: r.visibility,
    status: r.status,
    createdAt: r.created_at,
    contentType: r.current_version?.content_type ?? null,
    sizeBytes: r.current_version?.size_bytes ?? null,
    isExternal: Boolean(r.current_version?.external_url),
  }
}
