import { MoreVertical, Pencil, Share2, Trash2 } from 'lucide-react'
import type { MouseEvent } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDriveActions, type DriveTarget } from '@/features/drive/DriveActionsProvider'
import { cn } from '@/lib/utils'

export function ItemMenu({ item, className }: { item: DriveTarget; className?: string }) {
  const actions = useDriveActions()
  if (!actions) return null

  // Keep clicks off the underlying card (navigate / preview).
  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={stop}
          aria-label={`Actions for ${item.name}`}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md bg-card/80 text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={stop}>
        {item.kind === 'resource' && (
          <DropdownMenuItem onSelect={() => actions.promptShare(item)}>
            <Share2 className="h-4 w-4" aria-hidden="true" /> Share
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => actions.promptRename(item)}>
          <Pencil className="h-4 w-4" aria-hidden="true" /> Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => actions.promptDelete(item)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
