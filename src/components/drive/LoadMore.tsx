import { Button } from '@/components/ui/button'

export function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}) {
  if (!hasNextPage) return null
  return (
    <div className="flex justify-center pt-2">
      <Button variant="outline" onClick={onLoadMore} loading={isFetchingNextPage}>
        {isFetchingNextPage ? 'Loading…' : 'Load more'}
      </Button>
    </div>
  )
}
