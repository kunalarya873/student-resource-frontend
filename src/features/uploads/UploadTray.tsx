import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'

import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'

import { useUploads, type UploadStatus, type UploadTask } from './UploadProvider'

const ACTIVE: UploadStatus[] = ['queued', 'reserving', 'uploading', 'processing']
const isActive = (s: UploadStatus) => ACTIVE.includes(s)

export function UploadTray() {
  const { tasks, dismiss, clearFinished, cancel } = useUploads()
  if (tasks.length === 0) return null

  const active = tasks.filter((t) => isActive(t.status)).length
  const heading = active > 0 ? `Uploading ${active} item${active > 1 ? 's' : ''}` : 'Uploads complete'

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-fade-in">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-sm font-semibold">{heading}</p>
        <button
          type="button"
          onClick={clearFinished}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close upload tray"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <ul className="max-h-72 divide-y divide-border overflow-y-auto">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onCancel={() => cancel(task.id)}
            onDismiss={() => dismiss(task.id)}
          />
        ))}
      </ul>
    </div>
  )
}

function TaskRow({
  task,
  onCancel,
  onDismiss,
}: {
  task: UploadTask
  onCancel: () => void
  onDismiss: () => void
}) {
  const active = isActive(task.status)

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <StatusIcon status={task.status} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={task.name}>
          {task.name}
        </p>

        {task.status === 'uploading' ? (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {task.progress}%
            </span>
          </div>
        ) : active ? (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-full animate-pulse rounded-full bg-primary/50" />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{statusLabel(task)}</span>
          </div>
        ) : (
          <p
            className={cn(
              'truncate text-xs',
              task.status === 'error' ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {statusLabel(task)}
          </p>
        )}
      </div>

      {active ? (
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Cancel
        </button>
      ) : (
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={`Dismiss ${task.name}`}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </li>
  )
}

function statusLabel(task: UploadTask): string {
  switch (task.status) {
    case 'queued':
      return 'Queued'
    case 'reserving':
      return 'Preparing'
    case 'processing':
      return 'Finalizing'
    case 'done':
      return `Uploaded · ${formatBytes(task.size)}`
    case 'cancelled':
      return 'Cancelled'
    case 'error':
      return task.error ?? 'Upload failed'
    default:
      return ''
  }
}

function StatusIcon({ status }: { status: UploadStatus }) {
  if (status === 'done')
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden="true" />
  if (status === 'error')
    return <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
  if (status === 'cancelled')
    return <X className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
  return <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
}
