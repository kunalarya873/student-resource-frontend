import { useQuery } from '@tanstack/react-query'
import { Folder, HardDrive, PanelLeft, Share2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { QuotaMeter } from '@/components/drive/QuotaMeter'
import { driveApi } from '@/features/drive/driveApi'
import { toFolder } from '@/features/drive/types'
import { cn } from '@/lib/utils'

const PIN_KEY = 'archive.sidebar.pinned'

const navItems = [
  { to: '/', label: 'My Drive', icon: HardDrive, end: true },
  { to: '/shared', label: 'Shared', icon: Share2, end: false },
  { to: '/shared-with-me', label: 'Shared with me', icon: Users, end: false },
]

export function Sidebar() {
  const [pinned, setPinned] = useState(() => {
    try {
      return localStorage.getItem(PIN_KEY) === '1'
    } catch {
      return false
    }
  })
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  // Open on pin, hover, or when keyboard focus enters the sidebar.
  const expanded = pinned || hovered || focused

  useEffect(() => {
    try {
      localStorage.setItem(PIN_KEY, pinned ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [pinned])

  const { data: rootFolders = [] } = useQuery({
    queryKey: ['sidebar', 'root-folders'],
    queryFn: () => driveApi.rootFolders().then((p) => p.items.map(toFolder)),
    staleTime: 60_000,
  })

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-[width] duration-200 ease-out',
        expanded ? 'w-64' : 'w-16',
        expanded && !pinned && 'shadow-xl',
      )}
      aria-label="Primary"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      {/* Header: pin toggle + wordmark */}
      <div className="flex h-14 items-center gap-2 px-3">
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar open'}
          aria-pressed={pinned}
        >
          <PanelLeft className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
        {expanded && (
          <span className="truncate font-display text-lg font-semibold tracking-tight">
            Archive
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-3 rounded-lg px-[11px] text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {expanded && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        {/* Root folders under My Drive — only when open */}
        {expanded && rootFolders.length > 0 && (
          <div className="mt-3 animate-fade-in">
            <p className="px-[11px] pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
              Folders
            </p>
            <div className="flex flex-col gap-0.5">
              {rootFolders.map((f) => (
                <NavLink
                  key={f.folderId}
                  to={`/folders/${f.folderId}`}
                  className={({ isActive }) =>
                    cn(
                      'flex h-9 items-center gap-2.5 rounded-lg px-[11px] text-sm transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    )
                  }
                >
                  <Folder className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{f.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Quota */}
      <div className="border-t border-border p-3">
        <QuotaMeter expanded={expanded} />
      </div>
    </aside>
  )
}
