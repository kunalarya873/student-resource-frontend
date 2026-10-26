import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'

import { Sidebar } from '@/components/layout/Sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/AuthContext'
import { SearchBar } from '@/features/search/SearchBar'
import { PreviewProvider } from '@/features/preview/PreviewProvider'
import { ResourcePreviewModal } from '@/features/preview/ResourcePreviewModal'
import { ShareProvider } from '@/features/sharing/ShareProvider'
import { UploadProvider } from '@/features/uploads/UploadProvider'
import { UploadTray } from '@/features/uploads/UploadTray'
import { initials } from '@/lib/format'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <PreviewProvider>
    <ShareProvider>
    <UploadProvider>
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Content column — reserves the collapsed rail (64px); the sidebar overlays on expand */}
      <div className="flex min-h-screen flex-col pl-16">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-5 backdrop-blur">
          <div className="flex flex-1 justify-center sm:justify-start">
            <SearchBar />
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-full py-1 pl-3 pr-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account menu"
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
                  <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[13rem]">
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-medium">{user.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/profile')}>
                  <UserIcon className="h-4 w-4" aria-hidden="true" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => void logout()}>
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    </ShareProvider>
    </PreviewProvider>
  )
}
