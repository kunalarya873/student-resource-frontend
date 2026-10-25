import { cn } from '@/lib/utils'

interface BrandMarkProps {
  variant?: 'light' | 'dark'
  className?: string
}

/** Wordmark: a small archive glyph + the name set in the display serif. */
export function BrandMark({ variant = 'dark', className }: BrandMarkProps) {
  const onDark = variant === 'light'
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          onDark ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-primary text-primary-foreground',
        )}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8.5C4 7.67 4.67 7 5.5 7h3.26c.4 0 .78.16 1.06.44l.98.98c.28.28.66.44 1.06.44h6.88c.83 0 1.5.67 1.5 1.5v6.64c0 .83-.67 1.5-1.5 1.5h-13C4.67 19 4 18.33 4 17.5V8.5Z"
            fill="currentColor"
          />
          <rect x="7" y="4" width="10" height="2.2" rx="1.1" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
      <span
        className={cn(
          'font-display text-xl font-semibold tracking-tight',
          onDark ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        Archive
      </span>
    </span>
  )
}
