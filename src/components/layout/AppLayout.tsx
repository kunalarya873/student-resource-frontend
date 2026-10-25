import { LogOut } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { PreviewProvider } from '@/features/preview/PreviewProvider'
import { ResourcePreviewModal } from '@/features/preview/ResourcePreviewModal'
import { UploadProvider } from '@/features/uploads/UploadProvider'
import { UploadTray } from '@/features/uploads/UploadTray'
import { initials } from '@/lib/format'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <PreviewProvider>
    <UploadProvider>
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Content column — reserves the collapsed rail (64px); the sidebar overlays on expand */}
      <div className="flex min-h-screen flex-col pl-16">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-1.5 border-b border-border bg-background/85 px-5 backdrop-blur">
          {user && (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 rounded-full py-1 pl-3 pr-1 transition-colors hover:bg-accent"
                aria-label="View your profile"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium leading-tight">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.role_name}</p>
                </div>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
                  aria-hidden="true"
                >
                  {initials(user.full_name)}
                </span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Sign out">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          )}
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-5 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      <UploadTray />
      <ResourcePreviewModal />
    </div>
    </UploadProvider>
    </PreviewProvider>
  )
}
