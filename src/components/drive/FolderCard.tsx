import { Folder } from 'lucide-react'
import { useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { ItemMenu } from '@/components/drive/ItemMenu'
import {
  encodeDragItem,
  hasDragItem,
  readDragItem,
  useDriveDnd,
} from '@/features/drive/dnd'
import { useDriveActions } from '@/features/drive/DriveActionsProvider'
import type { DriveFolder } from '@/features/drive/types'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export function FolderCard({ folder }: { folder: DriveFolder }) {
  const navigate = useNavigate()
  const dnd = useDriveDnd()
  const actions = useDriveActions()
  const [over, setOver] = useState(false)

  function onDragStart(e: DragEvent) {
    if (!dnd) return
    encodeDragItem(e.dataTransfer, { kind: 'folder', id: folder.folderId, name: folder.name })
  }
  function onDragOver(e: DragEvent) {
    if (!dnd || !hasDragItem(e.dataTransfer)) return
    e.preventDefault()
    e.stopPropagation()
    setOver(true)
  }
  function onDrop(e: DragEvent) {
    if (!dnd || !hasDragItem(e.dataTransfer)) return
    e.preventDefault()
    e.stopPropagation()
    setOver(false)
    const item = readDragItem(e.dataTransfer)
    if (item) dnd.move(item, folder.folderId, folder.name)
  }

  return (
    <div
      draggable={Boolean(dnd)}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        'group relative rounded-xl border bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md',
        over ? 'border-primary bg-accent ring-2 ring-primary' : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={() => navigate(`/folders/${folder.folderId}`)}
        className="flex w-full items-center gap-3 rounded-xl p-3.5 pr-11 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            over ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground',
          )}
        >
          <Folder className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
            {folder.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {over ? 'Drop to move here' : `Updated ${formatDate(folder.updatedAt)}`}
          </p>
        </div>
      </button>

      {actions && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <ItemMenu item={{ kind: 'folder', id: folder.folderId, name: folder.name }} />
        </div>
      )}
    </div>
  )
}
