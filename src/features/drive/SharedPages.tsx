import type { UseQueryResult } from '@tanstack/react-query'
import { Share2, TriangleAlert, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { ResourceCard } from '@/components/drive/ResourceCard'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'

import type { DriveResource } from './types'
import { useSharedByMe, useSharedWithMe } from './useDrive'

interface SharedViewProps {
  title: string
  description: string
  query: UseQueryResult<DriveResource[]>
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription: string
}

function SharedView({
  title,
  description,
  query,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: SharedViewProps) {
  const { data, isLoading, isError, refetch } = query

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-medium tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-muted/50" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={TriangleAlert}
          title="Couldn’t load these resources"
          description="Something went wrong reaching the server."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((r) => (
            <ResourceCard key={r.resourceId} resource={r} />
          ))}
        </div>
      ) : (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  )
}

export function SharedWithMePage() {
  return (
    <SharedView
      title="Shared with me"
      description="Resources other people have shared with you."
      query={useSharedWithMe()}
      emptyIcon={Users}
      emptyTitle="Nothing shared with you yet"
      emptyDescription="When someone shares a file with you, it shows up here."
    />
  )
}

export function SharedByMePage() {
  return (
    <SharedView
      title="Shared"
      description="Resources you’ve shared with other people."
      query={useSharedByMe()}
      emptyIcon={Share2}
      emptyTitle="You haven’t shared anything yet"
      emptyDescription="Files you share with others will be listed here."
    />
  )
}
