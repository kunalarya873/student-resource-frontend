import { api } from '@/lib/api'

export interface ShareGrant {
  access_id: string
  resource_id: string
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

export const sharingApi = {
  list: (resourceId: string) =>
    api
      .get<PaginatedShareGrants>(`/resources/${resourceId}/share`, { params: { limit: 100 } })
      .then((r) => r.data),

  share: (resourceId: string, granteeEmail: string, permission: SharePermission) =>
    api
      .post<ShareGrant>(`/resources/${resourceId}/share`, {
        grantee_email: granteeEmail,
        permission,
      })
      .then((r) => r.data),

  revoke: (resourceId: string, accessId: string) =>
    api.delete(`/resources/${resourceId}/share/${accessId}`).then((r) => r.data),
}
