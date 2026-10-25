const ACCESS_KEY = 'archive.access_token'
const REFRESH_KEY = 'archive.refresh_token'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable (private mode) — session stays in memory for this tab only */
  }
}

function safeRemove(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export const tokenStore = {
  getAccess: () => safeGet(ACCESS_KEY),
  getRefresh: () => safeGet(REFRESH_KEY),
  set({ access_token, refresh_token }: TokenPair) {
    safeSet(ACCESS_KEY, access_token)
    safeSet(REFRESH_KEY, refresh_token)
  },
  clear() {
    safeRemove(ACCESS_KEY)
    safeRemove(REFRESH_KEY)
  },
  hasSession: () => Boolean(safeGet(ACCESS_KEY) && safeGet(REFRESH_KEY)),
}
