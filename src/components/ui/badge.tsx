import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'primary' | 'muted'

const tones: Record<Tone, string> = {
  neutral: 'border-border bg-secondary text-secondary-foreground',
  primary: 'border-primary/20 bg-accent text-accent-foreground',
  muted: 'border-transparent bg-muted text-muted-foreground',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
