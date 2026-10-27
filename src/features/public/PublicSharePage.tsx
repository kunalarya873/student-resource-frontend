import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import { publicApi } from './publicApi'
import { PublicFolderView } from './PublicFolderView'
import { PublicHeader } from './PublicHeader'
import { PublicResourceView } from './PublicResourceView'

export function PublicSharePage() {
  const { token } = useParams<{ token: string }>()

  const resolveQuery = useQuery({
    queryKey: ['public-share-resolve', token],
    queryFn: () => (token ? publicApi.resolve(token) : Promise.reject('No token')),
    enabled: Boolean(token),
    retry: false,
  })

  const resourceQuery = useQuery({
    queryKey: ['public-resource-details', token],
    queryFn: () => (token ? publicApi.resourceDetails(token) : Promise.reject('No token')),
    enabled: Boolean(token && resolveQuery.data?.kind === 'resource'),
    retry: false,
  })

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Invalid share link.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader shareToken={token} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {resolveQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
            <p className="mt-3 text-sm font-medium">Resolving academic resource…</p>
          </div>
        ) : resolveQuery.isError ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
              Link unavailable or restricted
            </h1>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This link is no longer accessible. The owner may have set it back to restricted,
              deleted the item, or the URL may be mistyped.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                <Link to="/">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return to AMU Cloud
                </Link>
              </Button>
            </div>
          </div>
        ) : resolveQuery.data?.kind === 'folder' ? (
          <PublicFolderView shareToken={token} />
        ) : resolveQuery.data?.kind === 'resource' ? (
          resourceQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="mt-3 text-xs">Loading file details…</p>
            </div>
          ) : resourceQuery.data ? (
            <PublicResourceView resource={resourceQuery.data} shareToken={token} />
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Resource details unavailable.
            </div>
          )
        ) : null}
      </main>

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <p>Aligarh Muslim University • Academic Student Resource Management Cloud</p>
      </footer>
    </div>
  )
}
