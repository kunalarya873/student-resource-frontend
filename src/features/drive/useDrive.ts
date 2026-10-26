import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useAuth } from '@/features/auth/AuthContext'

import { driveApi, PAGE_SIZE } from './driveApi'
import {
  fromFolderResource,
  fromResource,
  toBreadcrumb,
  toFolder,
  type Breadcrumb,
  type DriveFolder,
  type DriveResource,
} from './types'

interface DrivePage {
  folders: DriveFolder[]
  resources: DriveResource[]
  breadcrumbs: Breadcrumb[]
  title: string
  nextPage: number | null
}

/** Contents of the drive at a folder (or the root when folderId is null), paginated. */
export function useDriveContents(folderId: string | null) {
  const { user } = useAuth()
  const myId = user?.user_id

  const query = useInfiniteQuery({
    queryKey: ['drive', folderId ?? 'root'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<DrivePage> => {
      if (folderId === null) {
        const [folderPage, resources] = await Promise.all([
          driveApi.rootFolders(pageParam, PAGE_SIZE),
          // Root files = my own folder-less resources; loaded once with the first page.
          pageParam === 1 ? driveApi.listResources(0, 100) : Promise.resolve([]),
        ])
        return {
          folders: folderPage.items.map(toFolder),
          resources: resources
            .filter((r) => r.folder_id === null && r.owner_id === myId)
            .map(fromResource),
          breadcrumbs: [],
          title: 'My Drive',
          nextPage: pageParam < folderPage.total_pages ? pageParam + 1 : null,
        }
      }

      const c = await driveApi.folderContents(folderId, pageParam, PAGE_SIZE)
      const offset = (pageParam - 1) * PAGE_SIZE
      const moreFolders = offset + c.subfolders.length < c.total_subfolders
      const moreResources = offset + c.resources.length < c.total_resources
      return {
        folders: c.subfolders.map(toFolder),
        resources: c.resources.map(fromFolderResource),
        breadcrumbs: c.breadcrumbs.map(toBreadcrumb),
        title: c.folder.name,
        nextPage: moreFolders || moreResources ? pageParam + 1 : null,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  })

  const pages = query.data?.pages ?? []
  const folders = useMemo(() => pages.flatMap((p) => p.folders), [pages])
  const resources = useMemo(() => pages.flatMap((p) => p.resources), [pages])

  return {
    folders,
    resources,
    breadcrumbs: pages[0]?.breadcrumbs ?? [],
    title: pages[0]?.title ?? 'My Drive',
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}

function useSharedResources(key: string, fetcher: (offset: number) => Promise<DriveResource[]>) {
  const query = useInfiniteQuery({
    queryKey: ['drive', key],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetcher(pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
  })

  const items = useMemo(() => (query.data?.pages ?? []).flat(), [query.data])

  return {
    items,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}

export function useSharedWithMe() {
  return useSharedResources('shared-with-me', (offset) =>
    driveApi.sharedWithMe(offset, PAGE_SIZE).then((rs) => rs.map(fromResource)),
  )
}

export function useSharedByMe() {
  return useSharedResources('shared-by-me', (offset) =>
    driveApi.sharedByMe(offset, PAGE_SIZE).then((rs) => rs.map(fromResource)),
  )
}

/** Verified teacher/department notes — approved, institutionally-visible resources. */
export function useTeacherNotes() {
  return useSharedResources('teacher-notes', (offset) =>
    driveApi.teacherNotes(offset, PAGE_SIZE).then((rs) => rs.map(fromResource)),
  )
}

/** Folders shared with the current user (shown alongside shared files, browsable). */
export function useSharedFoldersWithMe() {
  return useQuery({
    queryKey: ['drive', 'shared-folders-with-me'],
    queryFn: () => driveApi.sharedFoldersWithMe(0, 100).then((fs) => fs.map(toFolder)),
  })
}

export type SharedResourcesResult = ReturnType<typeof useSharedResources>
