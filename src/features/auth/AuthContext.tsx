import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { AUTH_LOGOUT_EVENT } from '@/lib/api'
import { tokenStore, type TokenPair } from '@/lib/tokens'
import type { UserProfile } from '@/types/auth'

import { authApi } from './authApi'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: UserProfile | null
  status: AuthStatus
  /** Store a freshly issued token pair and load the profile it belongs to. */
  establishSession: (tokens: TokenPair) => Promise<UserProfile>
  /** Re-fetch the current profile (e.g. after a quota change). */
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const loadProfile = useCallback(async () => {
    const profile = await authApi.me()
    setUser(profile)
    setStatus('authenticated')
    return profile
  }, [])

  const establishSession = useCallback(
    async (tokens: TokenPair) => {
      tokenStore.set(tokens)
      return loadProfile()
    },
    [loadProfile],
  )

  const refreshProfile = useCallback(async () => {
    if (!tokenStore.hasSession()) return
    try {
      await loadProfile()
    } catch {
      /* interceptor handles a hard 401; transient errors keep the stale profile */
    }
  }, [loadProfile])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      /* best-effort; we clear locally regardless */
    }
    tokenStore.clear()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  // Bootstrap: if tokens exist, resolve the session before rendering routes.
  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      if (!tokenStore.hasSession()) {
        setStatus('unauthenticated')
        return
      }
      try {
        await loadProfile()
      } catch {
        if (cancelled) return
        tokenStore.clear()
        setUser(null)
        setStatus('unauthenticated')
      }
    }
    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [loadProfile])

  // The api layer fires this when a refresh ultimately fails.
  useEffect(() => {
    function handleForcedLogout() {
      setUser(null)
      setStatus('unauthenticated')
    }
    window.addEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, establishSession, refreshProfile, logout }),
    [user, status, establishSession, refreshProfile, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
