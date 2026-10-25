import { ChevronRight } from 'lucide-react'
import { Fragment, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'

import { hasDragItem, readDragItem, useDriveDnd } from '@/features/drive/dnd'
import type { Breadcrumb } from '@/features/drive/types'
import { cn } from '@/lib/utils'

export function Breadcrumbs({ trail }: { trail: Breadcrumb[] }) {
  // "My Drive" root is always the first crumb; the last crumb is the current folder.
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <Crumb to="/" label="My Drive" targetId={null} isCurrent={trail.length === 0} />
        {trail.map((c, i) => (
          <Fragment key={c.folderId}>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
            <Crumb
              to={`/folders/${c.folderId}`}
              label={c.name}
              targetId={c.folderId}
              isCurrent={i === trail.length - 1}
            />
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}

function Crumb({
  to,
  label,
  targetId,
  isCurrent,
}: {
  to: string
  label: string
  targetId: string | null
  isCurrent: boolean
}) {
  const dnd = useDriveDnd()
  const [over, setOver] = useState(false)

  // The current folder is where items already live — not a useful drop target.
  const droppable = Boolean(dnd) && !isCurrent

  function onDragOver(e: DragEvent) {
    if (!droppable || !hasDragItem(e.dataTransfer)) return
    e.preventDefault()
    setOver(true)
  }
  function onDrop(e: DragEvent) {
    if (!droppable || !hasDragItem(e.dataTransfer)) return
    e.preventDefault()
    setOver(false)
    const item = readDragItem(e.dataTransfer)
    if (item) dnd!.move(item, targetId, label)
  }

  const dropProps = droppable
    ? { onDragOver, onDragEnter: onDragOver, onDragLeave: () => setOver(false), onDrop }
    : {}

  if (isCurrent) {
    return (
      <li>
        <span aria-current="page" className="font-semibold text-foreground">
          {label}
        </span>
      </li>
    )
  }

  return (
    <li {...dropProps}>
      <Link
        to={to}
        className={cn(
          'rounded px-1.5 py-0.5 text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline',
          over && 'bg-accent text-accent-foreground ring-2 ring-primary',
        )}
      >
        {label}
      </Link>
    </li>
  )
}
