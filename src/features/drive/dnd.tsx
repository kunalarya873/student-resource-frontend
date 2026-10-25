import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CornerUpLeft } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'

import { driveApi } from './driveApi'

export interface DragItem {
  kind: 'folder' | 'resource'
  id: string
  name: string
}

export const DND_MIME = 'application/x-archive-item'

export function encodeDragItem(dt: DataTransfer, item: DragItem) {
  dt.setData(DND_MIME, JSON.stringify(item))
  dt.effectAllowed = 'move'
}

export function readDragItem(dt: DataTransfer): DragItem | null {
  const raw = dt.getData(DND_MIME)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DragItem
  } catch {
    return null
  }
}

export function hasDragItem(dt: DataTransfer): boolean {
  return dt.types.includes(DND_MIME)
}

interface DriveDndValue {
  currentFolderId: string | null
  /** Move a dragged item into a target folder (null = root). No-ops when invalid. */
  move: (item: DragItem, targetFolderId: string | null, targetName: string) => void
}

const DriveDndContext = createContext<DriveDndValue | null>(null)

// Optional — components outside a provider (e.g. Shared views) simply get null.
// eslint-disable-next-line react-refresh/only-export-components
export function useDriveDnd() {
  return useContext(DriveDndContext)
}

type Toast = { kind: 'success' | 'error'; message: string }

export function DriveDndProvider({
  currentFolderId,
  children,
}: {
  currentFolderId: string | null
  children: ReactNode
}) {
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((t: Toast) => {
    setToast(t)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const mutation = useMutation({
    mutationFn: ({ item, target }: { item: DragItem; target: string | null; targetName: string }) =>
      item.kind === 'folder'
        ? driveApi.moveFolder(item.id, target)
        : driveApi.moveResource(item.id, target),
    onSuccess: (_data, { item, target, targetName }) => {
      void queryClient.invalidateQueries({ queryKey: ['drive', currentFolderId ?? 'root'] })
      void queryClient.invalidateQueries({ queryKey: ['drive', target ?? 'root'] })
      void queryClient.invalidateQueries({ queryKey: ['sidebar', 'root-folders'] })
      showToast({ kind: 'success', message: `Moved “${item.name}” to ${targetName}` })
    },
    onError: (err) => {
      showToast({ kind: 'error', message: getApiErrorMessage(err, 'Couldn’t move that item.') })
    },
  })

  const move = useCallback(
    (item: DragItem, targetFolderId: string | null, targetName: string) => {
      // No-ops: into itself, or into the folder it already lives in.
      if (item.kind === 'folder' && item.id === targetFolderId) return
      if (targetFolderId === currentFolderId) return
      mutation.mutate({ item, target: targetFolderId, targetName })
    },
    [currentFolderId, mutation],
  )

  const value = useMemo<DriveDndValue>(() => ({ currentFolderId, move }), [currentFolderId, move])

  return (
    <DriveDndContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          className={cn(
            'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg animate-fade-in',
            toast.kind === 'error'
              ? 'border-destructive/30 bg-destructive text-destructive-foreground'
              : 'border-border bg-foreground text-background',
          )}
        >
          {toast.kind === 'error' ? (
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
          ) : (
            <CornerUpLeft className="h-4 w-4" aria-hidden="true" />
          )}
          {toast.message}
        </div>
      )}
    </DriveDndContext.Provider>
  )
}
