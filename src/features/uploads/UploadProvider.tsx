import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/lib/api'

import { uploadsApi } from './uploadsApi'

export type UploadStatus =
  | 'queued'
  | 'reserving'
  | 'uploading'
  | 'processing'
  | 'done'
  | 'error'
  | 'cancelled'

export interface UploadTask {
  id: string
  name: string
  size: number
  progress: number
  status: UploadStatus
  error?: string
  folderId: string | null
}

interface UploadsContextValue {
  tasks: UploadTask[]
  startUploads: (files: FileList | File[], folderId: string | null) => void
  dismiss: (id: string) => void
  clearFinished: () => void
  cancel: (id: string) => void
}

const UploadsContext = createContext<UploadsContextValue | undefined>(undefined)

export function UploadProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { refreshProfile } = useAuth()
  const [tasks, setTasks] = useState<UploadTask[]>([])
  const controllers = useRef<Map<string, AbortController>>(new Map())

  const patch = useCallback((id: string, changes: Partial<UploadTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)))
  }, [])

function generateUploadId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

  const runPipeline = useCallback(
    async (task: UploadTask, file: File) => {
      const controller = new AbortController()
      controllers.current.set(task.id, controller)

      try {
        patch(task.id, { status: 'uploading', progress: 0 })
        await uploadsApi.uploadDirect(
          file,
          task.folderId,
          (pct) => patch(task.id, { progress: pct }),
          controller.signal,
        )

        patch(task.id, { status: 'done', progress: 100 })
        // Surface the new file and the reduced quota immediately across all drive views
        void queryClient.invalidateQueries({ queryKey: ['drive'] })
        void refreshProfile()
      } catch (err) {
        console.error('[UploadProvider] Upload failed:', err)
        if (err instanceof DOMException && err.name === 'AbortError') {
          patch(task.id, { status: 'cancelled' })
        } else {
          patch(task.id, { status: 'error', error: getApiErrorMessage(err, 'Upload failed.') })
        }
      } finally {
        controllers.current.delete(task.id)
      }
    },
    [patch, queryClient, refreshProfile],
  )

  const startUploads = useCallback(
    (files: FileList | File[], folderId: string | null) => {
      const list = Array.from(files)
      if (list.length === 0) return
      const newTasks: Array<{ task: UploadTask; file: File }> = list.map((file) => ({
        file,
        task: {
          id: generateUploadId(),
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'queued' as UploadStatus,
          folderId,
        },
      }))
      setTasks((prev) => [...newTasks.map((n) => n.task), ...prev])
      newTasks.forEach(({ task, file }) => void runPipeline(task, file))
    },
    [runPipeline],
  )

  const cancel = useCallback((id: string) => {
    controllers.current.get(id)?.abort()
  }, [])

  const dismiss = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearFinished = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status === 'uploading' || t.status === 'processing'))
  }, [])

  const value = useMemo<UploadsContextValue>(
    () => ({ tasks, startUploads, dismiss, clearFinished, cancel }),
    [tasks, startUploads, dismiss, clearFinished, cancel],
  )

  return <UploadsContext.Provider value={value}>{children}</UploadsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUploads() {
  const ctx = useContext(UploadsContext)
  if (!ctx) throw new Error('useUploads must be used within an UploadProvider')
  return ctx
}
