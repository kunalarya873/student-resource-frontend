import { api } from '@/lib/api'

/** Fields shared by resource and folder grant payloads that the UI renders. */
export interface ShareGrant {
  access_id: string
  user_id: string
  grantee_email: string
  grantee_name: string
  permission: string
  granted_by: string
  created_at: string
}

interface PaginatedShareGrants {
  items: ShareGrant[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export type SharePermission = 'VIEW' | 'EDIT'
export type ShareKind = 'resource' | 'folder'

export interface PublicLinkInfo {
  is_public: boolean
  share_token: string | null
  share_url: string | null
  permission: string
}

/** Uniform sharing client for both resources and folders — same verbs,
 *  different base path, interchangeable in the share dialog. */
export interface ShareClient {
  list: (id: string) => Promise<PaginatedShareGrants>
  share: (id: string, granteeEmail: string, permission: SharePermission) => Promise<ShareGrant>
  revoke: (id: string, accessId: string) => Promise<unknown>
  getPublicLink: (id: string) => Promise<PublicLinkInfo>
  togglePublicLink: (id: string, isPublic: boolean) => Promise<PublicLinkInfo>
}

function makeShareClient(base: (id: string) => string): ShareClient {
  return {
    list: (id) =>
      api.get<PaginatedShareGrants>(`${base(id)}/share`, { params: { limit: 100 } }).then((r) => r.data),
    share: (id, granteeEmail, permission) =>
      api
        .post<ShareGrant>(`${base(id)}/share`, { grantee_email: granteeEmail, permission })
        .then((r) => r.data),
    revoke: (id, accessId) => api.delete(`${base(id)}/share/${accessId}`).then((r) => r.data),
    getPublicLink: (id) => api.get<PublicLinkInfo>(`${base(id)}/public-link`).then((r) => r.data),
    togglePublicLink: (id, isPublic) =>
      api.post<PublicLinkInfo>(`${base(id)}/public-link`, { is_public: isPublic }).then((r) => r.data),
  }
}

export const sharingApi = makeShareClient((id) => `/resources/${id}`)
export const folderSharingApi = makeShareClient((id) => `/folders/${id}`)

export function shareClientFor(kind: ShareKind): ShareClient {
  return kind === 'folder' ? folderSharingApi : sharingApi
}
