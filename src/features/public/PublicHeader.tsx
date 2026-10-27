import { Cloud, FolderGit2, LogIn, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { initials } from '@/lib/format'

export function PublicHeader({ shareToken }: { shareToken: string }) {
  const { user, status } = useAuth()
  const isAuthenticated = status === 'authenticated' && user !== null
  const redirectQuery = `?redirect=/s/${encodeURIComponent(shareToken)}`

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm dark:bg-emerald-500">
              <Cloud className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground">
                AMU Academic Cloud
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">
                Student Resource Commons
              </span>
            </div>
          </Link>

          <Badge tone="muted" className="hidden text-[10px] sm:inline-flex">
            Public Access
          </Badge>
        </div>

        {/* User state / Auth Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs">
                <Link to="/">
                  <FolderGit2 className="h-3.5 w-3.5" />
                  My Drive
                </Link>
              </Button>
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
                  title={user.full_name}
                >
                  {initials(user.full_name)}
                </span>
                <span className="hidden text-xs font-medium text-foreground md:inline">
                  {user.full_name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="ghost" className="gap-1.5 text-xs">
                <Link to={`/login${redirectQuery}`}>
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                <Link to={`/signup${redirectQuery}`}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Join & Save
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
