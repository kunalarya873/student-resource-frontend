import { type DragEvent } from 'react'

import { ItemMenu } from '@/components/drive/ItemMenu'
import { Badge } from '@/components/ui/badge'
import { FileTypeIcon } from '@/components/drive/FileTypeIcon'
import { encodeDragItem, useDriveDnd } from '@/features/drive/dnd'
import { useDriveActions } from '@/features/drive/DriveActionsProvider'
import type { DriveResource } from '@/features/drive/types'
import { usePreview } from '@/features/preview/PreviewProvider'
import { formatBytes, formatDate } from '@/lib/format'

const visibilityTone: Record<string, 'primary' | 'muted' | 'neutral'> = {
  PUBLIC: 'primary',
  DEPARTMENT: 'neutral',
  PRIVATE: 'muted',
}

export function ResourceCard({ resource }: { resource: DriveResource }) {
  const { open } = usePreview()
  const dnd = useDriveDnd()
  const actions = useDriveActions()

  const meta = [
    resource.sizeBytes ? formatBytes(resource.sizeBytes) : null,
    formatDate(resource.createdAt),
  ]
    .filter(Boolean)
    .join(' · ')

  function onDragStart(e: DragEvent) {
    if (!dnd) return
    encodeDragItem(e.dataTransfer, {
      kind: 'resource',
      id: resource.resourceId,
      name: resource.title,
    })
  }

  return (
    <div
      draggable={Boolean(dnd)}
      onDragStart={onDragStart}
      className="group relative rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <button
        type="button"
        onClick={() => open(resource)}
        className="flex w-full items-start gap-3 rounded-xl p-3.5 pr-11 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <FileTypeIcon contentType={resource.contentType} isExternal={resource.isExternal} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground" title={resource.title}>
            {resource.title}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="truncate text-xs text-muted-foreground">{meta}</span>
            <Badge tone={visibilityTone[resource.visibility] ?? 'muted'}>
              {resource.visibility.toLowerCase()}
            </Badge>
          </div>
        </div>
      </button>

      {actions && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <ItemMenu item={{ kind: 'resource', id: resource.resourceId, name: resource.title }} />
        </div>
      )}
    </div>
  )
}
