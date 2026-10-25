import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

type AlertVariant = 'error' | 'success' | 'info'

const config: Record<
  AlertVariant,
  { icon: typeof AlertCircle; classes: string; role: 'alert' | 'status' }
> = {
  error: {
    icon: AlertCircle,
    role: 'alert',
    classes: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  success: {
    icon: CheckCircle2,
    role: 'status',
    classes: 'border-success/30 bg-success/10 text-success',
  },
  info: {
    icon: Info,
    role: 'status',
    classes: 'border-border bg-muted text-muted-foreground',
  },
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

export function Alert({ variant = 'info', className, children, ...props }: AlertProps) {
  const { icon: Icon, classes, role } = config[variant]
  return (
    <div
      role={role}
      className={cn(
        'flex items-start gap-2.5 rounded-md border px-3.5 py-2.5 text-sm font-medium animate-fade-in',
        classes,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="leading-snug">{children}</span>
    </div>
  )
}
