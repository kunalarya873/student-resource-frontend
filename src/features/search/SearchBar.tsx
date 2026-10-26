import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { cn } from '@/lib/utils'

export function SearchBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const onSearch = location.pathname === '/search'

  const [text, setText] = useState(onSearch ? (params.get('q') ?? '') : '')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the field in sync when the URL's q changes (e.g. back/forward).
  useEffect(() => {
    if (onSearch) setText(params.get('q') ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSearch, params.get('q')])

  // Debounced live search as the user types.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    const trimmed = text.trim()
    timer.current = setTimeout(() => {
      if (trimmed.length >= 2) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: onSearch })
      }
    }, 350)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed.length >= 1) navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: onSearch })
  }

  function clear() {
    setText('')
    if (onSearch) navigate('/', { replace: true })
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full max-w-md">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search files…"
        aria-label="Search files"
        className={cn(
          'h-10 w-full rounded-full border border-input bg-secondary/60 pl-9 pr-9 text-sm text-foreground transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:border-ring focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring/25',
          '[&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </form>
  )
}
