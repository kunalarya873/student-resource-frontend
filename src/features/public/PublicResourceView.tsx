import { useQuery } from '@tanstack/react-query'
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react'

import { FileTypeIcon } from '@/components/drive/FileTypeIcon'
import { Button } from '@/components/ui/button'
import { formatBytes, formatDate } from '@/lib/format'

import { publicApi, type PublicResourceRead } from './publicApi'
import { PublicJoinBanner } from './PublicJoinBanner'

export function PublicResourceView({
  resource,
  shareToken,
}: {
  resource: PublicResourceRead
  shareToken: string
}) {
  const { data: dl, isLoading: dlLoading } = useQuery({
    queryKey: ['public-download', shareToken, 'attachment'],
    queryFn: () => publicApi.downloadInfo(shareToken, false),
    staleTime: 60_000,
  })

  const { data: previewData } = useQuery({
    queryKey: ['public-download', shareToken, 'inline'],
    queryFn: () => publicApi.downloadInfo(shareToken, true),
    staleTime: 60_000,
  })

  const ct = resource.content_type?.toLowerCase() || ''
  const isImage = ct.startsWith('image/')
  const isVideo = ct.startsWith('video/')
  const isPdf = ct === 'application/pdf'

  return (
    <div className="space-y-6">
      <PublicJoinBanner shareToken={shareToken} itemName={resource.title} kind="resource" />

      {/* Main Resource Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 border-b border-border bg-card/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5">
              <FileTypeIcon contentType={resource.content_type ?? null} isExternal={resource.is_external} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {resource.title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>Shared by {resource.owner_name}</span>
                <span>•</span>
                <span>{formatDate(resource.created_at)}</span>
                {resource.size_bytes > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatBytes(resource.size_bytes)}</span>
                  </>
                )}
                {resource.content_type && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{resource.content_type}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {resource.is_external ? (
              <Button asChild size="sm" className="gap-1.5 text-xs">
                <a href={resource.external_url || '#'} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open Link
                </a>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                disabled={dlLoading || !dl}
              >
                <a
                  href={dl?.download_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={dl?.filename}
                >
                  {dlLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download Asset
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Description if present */}
        {resource.description && (
          <div className="border-b border-border/60 bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Note: </span>
            {resource.description}
          </div>
        )}

        {/* Preview Container */}
        <div className="flex min-h-[360px] flex-col items-center justify-center p-6 text-center">
          {resource.is_external ? (
            <div className="max-w-md space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                <ExternalLink className="h-6 w-6" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">External Academic Web Asset</h2>
              <p className="text-xs text-muted-foreground">
                This academic resource links to an external verified resource:{' '}
                <span className="font-mono text-primary underline">{resource.external_url}</span>
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2 text-xs">
                <a href={resource.external_url || '#'} target="_blank" rel="noopener noreferrer">
                  Open in New Tab
                </a>
              </Button>
            </div>
          ) : isImage && previewData?.download_url ? (
            <img
              src={previewData.download_url}
              alt={resource.title}
              className="max-h-[600px] w-auto rounded-lg object-contain shadow-sm"
            />
          ) : isVideo && previewData?.download_url ? (
            <video
              src={previewData.download_url}
              controls
              className="max-h-[600px] w-full max-w-3xl rounded-lg shadow-sm"
            />
          ) : isPdf && previewData?.download_url ? (
            <iframe
              src={previewData.download_url}
              title={resource.title}
              className="h-[650px] w-full rounded-lg border border-border shadow-sm"
            />
          ) : (
            <div className="max-w-sm space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                <FileText className="h-7 w-7 text-muted-foreground/80" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">{resource.title}</h2>
              <p className="text-xs text-muted-foreground">
                Preview is not rendered directly in-browser for this file format ({resource.content_type || 'binary'}). Download the file to view its full contents.
              </p>
              {dl?.download_url && (
                <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                  <a href={dl.download_url} download={dl.filename}>
                    <Download className="h-3.5 w-3.5" />
                    Download ({formatBytes(resource.size_bytes)})
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
