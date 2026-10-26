import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { Dialog } from '@/components/ui/dialog'

import { ShareDialog } from './ShareDialog'

interface ShareTarget {
  id: string
  name: string
}

interface ShareContextValue {
  open: (target: ShareTarget) => void
  close: () => void
}

const ShareContext = createContext<ShareContextValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useShare() {
  return useContext(ShareContext)
}

export function ShareProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ShareTarget | null>(null)

  const open = useCallback((t: ShareTarget) => setTarget(t), [])
  const close = useCallback(() => setTarget(null), [])

  const value = useMemo(() => ({ open, close }), [open, close])

  return (
    <ShareContext.Provider value={value}>
      {children}
      <Dialog open={target !== null} onOpenChange={(o) => !o && close()}>
        {target && <ShareDialog resourceId={target.id} resourceName={target.name} />}
      </Dialog>
    </ShareContext.Provider>
  )
}
