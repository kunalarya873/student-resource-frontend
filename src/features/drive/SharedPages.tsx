import { ListFilter, Share2, TriangleAlert, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ListControls } from '@/components/drive/ListControls'
import { LoadMore } from '@/components/drive/LoadMore'
import { ResourceCard } from '@/components/drive/ResourceCard'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'

import { filterResources, sortResources, type SortDir, type SortKey } from './listControls'
import { useSharedByMe, useSharedWithMe, type SharedResourcesResult } from './useDrive'

interface SharedViewProps {
  title: string
  description: string
  query: SharedResourcesResult
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
  const { items: raw, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = query
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [filter, setFilter] = useState('')

  const items = useMemo(
    () => sortResources(filterResources(raw, filter), sortKey, sortDir),
    [raw, filter, sortKey, sortDir],
  )
  const hasAny = raw.length > 0
  const hasVisible = items.length > 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-medium tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {hasAny && (
        <ListControls
          filter={filter}
          onFilter={setFilter}
          sortKey={sortKey}
          onSortKey={setSortKey}
          sortDir={sortDir}
          onToggleDir={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          placeholder="Filter these files…"
        />
      )}

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
      ) : hasAny && hasVisible ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r) => (
              <ResourceCard key={r.resourceId} resource={r} />
            ))}
          </div>
          <LoadMore
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        </div>
      ) : hasAny && !hasVisible ? (
        <EmptyState
          icon={ListFilter}
          title="No matches"
          description={`Nothing here matches “${filter}”.`}
        />
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
