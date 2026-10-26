import { useQuery } from '@tanstack/react-query'
import { Download, ExternalLink, FileQuestion, Loader2, Share2, X } from 'lucide-react'
import type { CSSProperties } from 'react'

import { FileTypeIcon } from '@/components/drive/FileTypeIcon'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { driveApi } from '@/features/drive/driveApi'
import type { ResourceDownloadInfo } from '@/features/drive/types'
import { useShare } from '@/features/sharing/ShareProvider'
import { getApiErrorMessage } from '@/lib/api'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'

import { usePreview } from './PreviewProvider'

const WIDE = { '--dialog-w': '960px' } as CSSProperties

export function ResourcePreviewModal() {
  const { current, close } = usePreview()
  const open = current !== null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      {current && (
        <DialogContent showClose={false} style={WIDE} className="overflow-hidden p-0">
          <PreviewBody resourceId={current.resourceId} title={current.title} />
        </DialogContent>
      )}
    </Dialog>
  )
}

function isMediaType(ct: string | undefined) {
  if (!ct) return false
  const c = ct.toLowerCase()
  return c.startsWith('image/') || c.startsWith('video/')
}

function PreviewBody({ resourceId, title }: { resourceId: string; title: string }) {
  const share = useShare()
  // Inline URL renders in the browser (preview); the attachment URL forces a download.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['download', resourceId, 'inline'],
    queryFn: () => driveApi.downloadInfo(resourceId, true),
    staleTime: 60_000,
  })
  const { data: dl } = useQuery({
    queryKey: ['download', resourceId, 'attachment'],
    queryFn: () => driveApi.downloadInfo(resourceId, false),
    staleTime: 60_000,
  })

  const onMediaStage = isMediaType(data?.content_type)
  const meta = data
    ? [data.content_type, data.size_bytes ? formatBytes(data.size_bytes) : null]
        .filter(Boolean)
        .join(' · ')
    : 'Preparing preview…'

  return (
    <div className="flex max-h-[88vh] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-3.5">
        <FileTypeIcon contentType={data?.content_type ?? null} isExternal={data?.is_external} />
        <div className="min-w-0 flex-1">
          <DialogTitle className="truncate text-base leading-tight">{title}</DialogTitle>
          <DialogDescription className="truncate text-xs">{meta}</DialogDescription>
        </div>
        {data && share && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => share.open({ id: resourceId, name: title, kind: 'resource' })}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" /> Share
          </Button>
        )}
        {data && (
          <Button asChild size="sm" variant={data.is_external ? 'default' : 'outline'} className="shrink-0">
            <a
              href={data.is_external ? data.download_url : (dl?.download_url ?? data.download_url)}
              target="_blank"
              rel="noopener noreferrer"
              download={data.filename}
            >
              {data.is_external ? (
                <>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" aria-hidden="true" /> Download
                </>
              )}
            </a>
          </Button>
        )}
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Close preview">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DialogClose>
      </div>

      {/* Stage */}
      <div
        className={cn(
          'flex min-h-[360px] flex-1 items-center justify-center overflow-auto p-5 transition-colors',
          onMediaStage
            ? 'bg-neutral-950 [background-image:radial-gradient(circle_at_center,#1f1f22,#0a0a0a)]'
            : 'bg-muted/40',
        )}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            <p className="text-sm">Preparing preview…</p>
          </div>
        ) : isError || !data ? (
          <Alert variant="error">{getApiErrorMessage(error, 'Could not load this file.')}</Alert>
        ) : (
          <Preview info={data} />
        )}
      </div>
    </div>
  )
}

function Preview({ info }: { info: ResourceDownloadInfo }) {
  const ct = info.content_type.toLowerCase()
  const url = info.download_url

  if (info.is_external) {
    return (
      <Fallback
        message="This resource is an external link."
        action={
          <Button asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open link
            </a>
          </Button>
        }
      />
    )
  }

  if (ct.startsWith('image/')) {
    return (
      <img
        src={url}
        alt={info.filename}
        className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
      />
    )
  }
  if (ct.startsWith('video/')) {
    return (
      <video
        src={url}
        controls
        autoPlay
        className="max-h-[72vh] max-w-full rounded-lg shadow-2xl ring-1 ring-white/10"
      />
    )
  }
  if (ct.startsWith('audio/')) {
    return (
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <audio src={url} controls className="w-full" />
      </div>
    )
  }
  if (ct.includes('pdf') || ct.startsWith('text/') || ct.includes('json')) {
    return (
      <iframe
        src={url}
        title={info.filename}
        className="h-[74vh] w-full rounded-lg border border-border bg-card shadow-sm"
      />
    )
  }

  return (
    <Fallback
      message="No inline preview is available for this file type."
      action={
        <Button asChild>
          <a href={url} target="_blank" rel="noopener noreferrer" download={info.filename}>
            <Download className="h-4 w-4" aria-hidden="true" /> Download file
          </a>
        </Button>
      }
    />
  )
}

function Fallback({ message, action }: { message: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileQuestion className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  )
}
