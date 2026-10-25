import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/AuthContext'

import { driveApi } from './driveApi'
import {
  fromFolderResource,
  fromResource,
  toBreadcrumb,
  toFolder,
  type Breadcrumb,
  type DriveFolder,
  type DriveResource,
} from './types'

export interface DriveContents {
  folders: DriveFolder[]
  resources: DriveResource[]
  breadcrumbs: Breadcrumb[]
  title: string
}

/** Contents of the drive at a given folder, or the root when folderId is null. */
export function useDriveContents(folderId: string | null) {
  const { user } = useAuth()
  const myId = user?.user_id

  return useQuery<DriveContents>({
    queryKey: ['drive', folderId ?? 'root'],
    queryFn: async () => {
      if (folderId === null) {
        const [folderPage, resources] = await Promise.all([
          driveApi.rootFolders(),
          driveApi.listResources(),
        ])
        return {
          folders: folderPage.items.map(toFolder),
          // Root files = my own resources not filed under any folder.
          resources: resources
            .filter((r) => r.folder_id === null && r.owner_id === myId)
            .map(fromResource),
          breadcrumbs: [],
          title: 'My Drive',
        }
      }

      const contents = await driveApi.folderContents(folderId)
      return {
        folders: contents.subfolders.map(toFolder),
        resources: contents.resources.map(fromFolderResource),
        breadcrumbs: contents.breadcrumbs.map(toBreadcrumb),
        title: contents.folder.name,
      }
    },
  })
}

export function useSharedWithMe() {
  return useQuery<DriveResource[]>({
    queryKey: ['drive', 'shared-with-me'],
    queryFn: () => driveApi.sharedWithMe().then((rs) => rs.map(fromResource)),
  })
}

export function useSharedByMe() {
  return useQuery<DriveResource[]>({
    queryKey: ['drive', 'shared-by-me'],
    queryFn: () => driveApi.sharedByMe().then((rs) => rs.map(fromResource)),
  })
}
