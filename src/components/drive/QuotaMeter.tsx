import { HardDrive } from 'lucide-react'

import { useAuth } from '@/features/auth/AuthContext'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/utils'

export function QuotaMeter({ expanded }: { expanded: boolean }) {
  const { user } = useAuth()
  const quota = user?.quota
  if (!quota) return null

  const pct =
    quota.quota_bytes > 0
      ? Math.min(100, Math.round((quota.used_bytes / quota.quota_bytes) * 100))
      : 0
  const near = pct >= 85
  const label = `Storage: ${formatBytes(quota.used_bytes)} of ${formatBytes(quota.quota_bytes)} used (${pct}%)`

  if (!expanded) {
    return (
      <div className="flex justify-center py-2" title={label} aria-label={label} role="img">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <HardDrive className="h-[18px] w-[18px] text-muted-foreground" aria-hidden="true" />
          <span
            className={cn(
              'absolute -bottom-0.5 left-1 right-1 h-1 overflow-hidden rounded-full bg-border',
            )}
          >
            <span
              className={cn('block h-full rounded-full', near ? 'bg-destructive' : 'bg-primary')}
              style={{ width: `${pct}%` }}
            />
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 px-1 py-1">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <HardDrive className="h-3.5 w-3.5" aria-hidden="true" />
        Storage
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn('h-full rounded-full transition-all', near ? 'bg-destructive' : 'bg-primary')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatBytes(quota.used_bytes)} of {formatBytes(quota.quota_bytes)}
      </p>
    </div>
  )
}
