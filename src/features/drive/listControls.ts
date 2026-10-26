import type { DriveFolder, DriveResource } from './types'

export type SortKey = 'name' | 'date'
export type SortDir = 'asc' | 'desc'

export function filterFolders(items: DriveFolder[], q: string): DriveFolder[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return items
  return items.filter((f) => f.name.toLowerCase().includes(needle))
}

export function filterResources(items: DriveResource[], q: string): DriveResource[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return items
  return items.filter((r) => r.title.toLowerCase().includes(needle))
}

export function sortFolders(items: DriveFolder[], key: SortKey, dir: SortDir): DriveFolder[] {
  const mul = dir === 'asc' ? 1 : -1
  return [...items].sort((a, b) =>
    key === 'name'
      ? mul * a.name.localeCompare(b.name)
      : mul * a.updatedAt.localeCompare(b.updatedAt),
  )
}

export function sortResources(items: DriveResource[], key: SortKey, dir: SortDir): DriveResource[] {
  const mul = dir === 'asc' ? 1 : -1
  return [...items].sort((a, b) =>
    key === 'name'
      ? mul * a.title.localeCompare(b.title)
      : mul * a.createdAt.localeCompare(b.createdAt),
  )
}
