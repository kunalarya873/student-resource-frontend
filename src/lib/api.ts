import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { tokenStore, type TokenPair } from '@/lib/tokens'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
})

/**
 * Emitted when the refresh token is rejected and the session can no longer be
 * recovered. The auth provider listens for this to tear down local state and
 * bounce the user to /login — without each call site having to handle it.
 */
export const AUTH_LOGOUT_EVENT = 'archive:auth-logout'
function broadcastLogout() {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
}

// Attach the access token to every outgoing request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
      config.headers.delete('content-type')
    } else if (config.headers) {
      delete (config.headers as Record<string, unknown>)['Content-Type']
      delete (config.headers as Record<string, unknown>)['content-type']
    }
  }
  return config
})

// --- Single-flight refresh ------------------------------------------------
// Many requests can 401 at once (e.g. a dashboard firing several queries). We
// run exactly one /auth/refresh and let the rest wait on it, so we never spend
// the rotating refresh token more than once per expiry.
let refreshPromise: Promise<string> | null = null

async function runRefresh(): Promise<string> {
  const refreshToken = tokenStore.getRefresh()
  if (!refreshToken) throw new Error('No refresh token')

  // A bare axios call (not `api`) so this request skips the interceptors.
  const { data } = await axios.post<TokenPair>(
    `${BASE_URL}/auth/refresh`,
    { refresh_token: refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )
  tokenStore.set(data)
  return data.access_token
}

interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''

    const isAuthEndpoint =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/public/')

    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = runRefresh().finally(() => {
            refreshPromise = null
          })
        }
        const newAccess = await refreshPromise
        original.headers = original.headers ?? {}
        ;(original.headers as Record<string, string>).Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch (refreshErr) {
        tokenStore.clear()
        broadcastLogout()
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  },
)

/** Turn an axios error into a single human-readable sentence for the UI. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Check that the backend is running.'
    }
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string }
      if (first?.msg) return first.msg.replace(/^Value error, /, '')
    }
  }
  return fallback
}
