import { ArrowDownUp, ListFilter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { SortDir, SortKey } from '@/features/drive/listControls'

interface ListControlsProps {
  filter: string
  onFilter: (v: string) => void
  sortKey: SortKey
  onSortKey: (v: SortKey) => void
  sortDir: SortDir
  onToggleDir: () => void
  placeholder?: string
}

export function ListControls({
  filter,
  onFilter,
  sortKey,
  onSortKey,
  sortDir,
  onToggleDir,
  placeholder = 'Filter…',
}: ListControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <ListFilter
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={filter}
          onChange={(e) => onFilter(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-9 pl-9"
        />
      </div>
      <Select
        value={sortKey}
        onChange={(e) => onSortKey(e.target.value as SortKey)}
        aria-label="Sort by"
        className="h-9 w-auto min-w-[9rem]"
      >
        <option value="name">Name</option>
        <option value="date">Date</option>
      </Select>
      <Button
        size="sm"
        variant="outline"
        className="h-9"
        onClick={onToggleDir}
        aria-label={`Sort direction: ${sortDir === 'asc' ? 'ascending' : 'descending'}`}
        title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
      >
        <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
        {sortDir === 'asc' ? 'Asc' : 'Desc'}
      </Button>
    </div>
  )
}
