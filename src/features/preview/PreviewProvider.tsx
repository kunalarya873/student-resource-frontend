import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { DriveResource } from '@/features/drive/types'

interface PreviewContextValue {
  current: DriveResource | null
  open: (resource: DriveResource) => void
  close: () => void
}

const PreviewContext = createContext<PreviewContextValue | undefined>(undefined)

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<DriveResource | null>(null)

  const open = useCallback((resource: DriveResource) => setCurrent(resource), [])
  const close = useCallback(() => setCurrent(null), [])

  const value = useMemo(() => ({ current, open, close }), [current, open, close])

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreview() {
  const ctx = useContext(PreviewContext)
  if (!ctx) throw new Error('usePreview must be used within a PreviewProvider')
  return ctx
}
