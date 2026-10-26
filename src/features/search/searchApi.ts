import { api } from '@/lib/api'
import type { DriveResource } from '@/features/drive/types'

export interface SearchResultItem {
  resource_id: string
  title: string
  description: string | null
  subject_code: string | null
  subject_name: string | null
  owner_name: string
  visibility: string
  status: string
  rank: number
  created_at: string | null
}

export interface SearchResponse {
  total_count: number
  page: number
  limit: number
  results: SearchResultItem[]
}

export const SEARCH_PAGE_SIZE = 50

export const searchApi = {
  search: (q: string, page = 1, limit = SEARCH_PAGE_SIZE) =>
    api
      .get<SearchResponse>('/search', { params: { q, page, limit } })
      .then((r) => r.data),
}

/** Adapt a search hit to the shared DriveResource shape so ResourceCard/preview can render it. */
export function fromSearchItem(r: SearchResultItem): DriveResource {
  return {
    kind: 'resource',
    resourceId: r.resource_id,
    title: r.title,
    description: r.description,
    visibility: r.visibility,
    status: r.status,
    createdAt: r.created_at ?? '',
    contentType: null,
    sizeBytes: null,
    isExternal: false,
  }
}
