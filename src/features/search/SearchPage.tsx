import { useInfiniteQuery } from '@tanstack/react-query'
import { SearchX, TriangleAlert } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { LoadMore } from '@/components/drive/LoadMore'
import { ResourceCard } from '@/components/drive/ResourceCard'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'

import { fromSearchItem, searchApi, SEARCH_PAGE_SIZE } from './searchApi'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim()

  const { data, isLoading, isError, refetch, isFetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['search', q],
      initialPageParam: 1,
      queryFn: ({ pageParam }) => searchApi.search(q, pageParam, SEARCH_PAGE_SIZE),
      getNextPageParam: (lastPage) =>
        lastPage.page * lastPage.limit < lastPage.total_count ? lastPage.page + 1 : undefined,
      enabled: q.length >= 1,
    })

  const results = data?.pages.flatMap((p) => p.results) ?? []
  const totalCount = data?.pages[0]?.total_count ?? 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-medium tracking-tight">Search</h1>
        {q ? (
          <p className="text-sm text-muted-foreground">
            {data ? `${totalCount} result${totalCount === 1 ? '' : 's'} for ` : 'Searching for '}
            <span className="font-medium text-foreground">“{q}”</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Type at least 2 characters to search your files.</p>
        )}
      </div>

      {!q ? null : isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-muted/50" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={TriangleAlert}
          title="Search failed"
          description="Something went wrong reaching the server."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <ResourceCard key={r.resource_id} resource={fromSearchItem(r)} />
            ))}
          </div>
          <LoadMore
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No matches"
          description={`No files match “${q}”. Try a different word.`}
        />
      )}

      {isFetching && !isLoading && (
        <p className="text-center text-xs text-muted-foreground" aria-live="polite">
          Searching…
        </p>
      )}
    </div>
  )
}
