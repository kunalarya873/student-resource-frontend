import { FolderOpen, FolderPlus, TriangleAlert, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useParams } from 'react-router-dom'

import { Breadcrumbs } from '@/components/drive/Breadcrumbs'
import { FolderCard } from '@/components/drive/FolderCard'
import { ResourceCard } from '@/components/drive/ResourceCard'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { useUploads } from '@/features/uploads/UploadProvider'
import { cn } from '@/lib/utils'

import { DriveActionsProvider, useDriveActions } from './DriveActionsProvider'
import { DriveDndProvider } from './dnd'
import { useDriveContents } from './useDrive'

export function DrivePage() {
  const { folderId } = useParams<{ folderId?: string }>()
  const folderKey = folderId ?? null

  return (
    <DriveDndProvider currentFolderId={folderKey}>
      <DriveActionsProvider currentFolderId={folderKey}>
        <DriveView folderKey={folderKey} isFolder={Boolean(folderId)} />
      </DriveActionsProvider>
    </DriveDndProvider>
  )
}

function DriveView({ folderKey, isFolder }: { folderKey: string | null; isFolder: boolean }) {
  const { data, isLoading, isError, refetch, isFetching } = useDriveContents(folderKey)
  const { startUploads } = useUploads()
  const actions = useDriveActions()

  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)

  function openPicker() {
    inputRef.current?.click()
  }
  function onPicked(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) startUploads(e.target.files, folderKey)
    e.target.value = ''
  }

  function onDragEnter(e: DragEvent) {
    if (!e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }
  function onDragOver(e: DragEvent) {
    if (e.dataTransfer.types.includes('Files')) e.preventDefault()
  }
  function onDragLeave() {
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragging(false)
    }
  }
  function onDrop(e: DragEvent) {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    if (e.dataTransfer.files.length > 0) startUploads(e.dataTransfer.files, folderKey)
  }

  return (
    <div
      className="relative space-y-6"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input ref={inputRef} type="file" multiple className="hidden" onChange={onPicked} />

      <div className="flex items-center justify-between gap-4">
        <Breadcrumbs trail={data?.breadcrumbs ?? []} />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => actions?.promptNewFolder()}>
            <FolderPlus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">New folder</span>
          </Button>
          <Button size="sm" onClick={openPicker}>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Upload
          </Button>
        </div>
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : isError ? (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn’t load this folder"
          description="Something went wrong reaching the server."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : data && (data.folders.length > 0 || data.resources.length > 0) ? (
        <div className="space-y-8">
          {data.folders.length > 0 && (
            <Section title="Folders" count={data.folders.length}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.folders.map((f) => (
                  <FolderCard key={f.folderId} folder={f} />
                ))}
              </div>
            </Section>
          )}

          {data.resources.length > 0 && (
            <Section title="Files" count={data.resources.length}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.resources.map((r) => (
                  <ResourceCard key={r.resourceId} resource={r} />
                ))}
              </div>
            </Section>
          )}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title={isFolder ? 'This folder is empty' : 'Your drive is empty'}
          description="Drag files here, or use the buttons above to add a folder or file."
          action={
            <Button onClick={openPicker}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload a file
            </Button>
          }
        />
      )}

      {isFetching && !isLoading && (
        <p className="text-center text-xs text-muted-foreground" aria-live="polite">
          Refreshing…
        </p>
      )}

      {/* Drag-and-drop overlay (file upload) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm transition-opacity',
          dragging ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden={!dragging}
      >
        <div className="flex flex-col items-center gap-2 text-primary">
          <Upload className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm font-semibold">Drop files to upload</p>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">
        {title} <span className="text-muted-foreground/60">({count})</span>
      </h2>
      {children}
    </section>
  )
}

function GridSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading contents">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-muted/50" />
        ))}
      </div>
    </div>
  )
}
