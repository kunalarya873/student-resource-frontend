import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  Download,
  Folder as FolderIcon,
  Loader2,
  Search,
} from 'lucide-react'
import { useState } from 'react'

import { FileTypeIcon } from '@/components/drive/FileTypeIcon'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/format'

import { publicApi, type PublicFolderContentsResponse } from './publicApi'
import { PublicJoinBanner } from './PublicJoinBanner'

export function PublicFolderView({ shareToken }: { shareToken: string }) {
  const [currentSubfolderId, setCurrentSubfolderId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-folder', shareToken, currentSubfolderId, search],
    queryFn: () =>
      publicApi.folderContents(shareToken, {
        subfolder_id: currentSubfolderId,
        q: search || undefined,
      }),
  })

  return (
    <div className="space-y-6">
      {data?.folder && (
        <PublicJoinBanner
          shareToken={shareToken}
          itemName={data.folder.name}
          kind="folder"
        />
      )}

      {/* Main Container */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        {/* Top bar with Breadcrumbs & Search */}
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto text-sm">
            {data?.breadcrumbs && data.breadcrumbs.length > 0 ? (
              data.breadcrumbs.map((crumb, idx) => {
                const isLast = idx === data.breadcrumbs.length - 1
                return (
                  <div key={crumb.folder_id} className="flex items-center gap-1.5 shrink-0">
                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
                    {isLast ? (
                      <span className="font-semibold text-foreground">{crumb.name}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentSubfolderId(
                            idx === 0 ? null : crumb.folder_id
                          )
                        }
                        className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
                      >
                        {crumb.name}
                      </button>
                    )}
                  </div>
                )
              })
            ) : (
              <span className="font-semibold text-foreground">Loading folder…</span>
            )}
          </nav>

          {/* Search inside folder */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <Input
              type="search"
              placeholder="Filter in this folder…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Folder Metadata Banner */}
        {data?.folder && (
          <div className="border-b border-border/50 bg-muted/15 px-6 py-3 text-xs text-muted-foreground">
            <span>Shared publicly by <strong className="font-medium text-foreground">{data.folder.owner_name}</strong></span>
            <span className="mx-2">•</span>
            <span>Created {formatDate(data.folder.created_at)}</span>
            <span className="mx-2">•</span>
            <span>
              {data.total_subfolders} {data.total_subfolders === 1 ? 'subfolder' : 'subfolders'},{' '}
              {data.total_resources} {data.total_resources === 1 ? 'file' : 'files'}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-2 text-xs">Loading contents…</p>
            </div>
          ) : isError ? (
            <div className="py-8">
              <Alert variant="error">Unable to load this folder. The share may be restricted.</Alert>
            </div>
          ) : !data || (data.subfolders.length === 0 && data.resources.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <FolderIcon className="h-6 w-6 text-muted-foreground/80" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-foreground">Folder is empty</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {search ? 'No files or subfolders match your search.' : 'There are no files or subfolders inside here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Subfolders Section */}
              {data.subfolders.length > 0 && (
                <div>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Subfolders
                  </h2>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {data.subfolders.map((folder) => (
                      <button
                        key={folder.folder_id}
                        type="button"
                        onClick={() => setCurrentSubfolderId(folder.folder_id)}
                        className="group flex items-center gap-3 rounded-lg border border-border/80 bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                          <FolderIcon className="h-4 w-4 fill-amber-500/20" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground group-hover:text-primary">
                            {folder.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDate(folder.created_at)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Files Section */}
              {data.resources.length > 0 && (
                <div>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Files & Resources
                  </h2>
                  <div className="divide-y divide-border/60 rounded-lg border border-border/80 bg-card">
                    {data.resources.map((res) => (
                      <PublicFileRow
                        key={res.resource_id}
                        resource={res}
                        shareToken={shareToken}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PublicFileRow({
  resource,
  shareToken,
}: {
  resource: PublicFolderContentsResponse['resources'][number]
  shareToken: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 text-xs transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-3 min-w-0">
        <FileTypeIcon contentType={null} isExternal={false} />
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{resource.title}</p>
          <p className="text-[11px] text-muted-foreground">
            Added {formatDate(resource.created_at)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <PublicDownloadButton shareToken={resource.share_token || shareToken} />
      </div>
    </div>
  )
}

function PublicDownloadButton({
  shareToken,
}: {
  shareToken: string
}) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const info = await publicApi.downloadInfo(shareToken, false)
      if (info.download_url) {
        window.open(info.download_url, '_blank')
      }
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleDownload}
      disabled={loading}
      className="h-7 gap-1 px-2.5 text-[11px]"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      Download
    </Button>
  )
}
