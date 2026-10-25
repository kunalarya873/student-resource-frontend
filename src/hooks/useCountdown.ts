import { useCallback, useEffect, useRef, useState } from 'react'

/** A simple seconds countdown. `start(n)` begins at n; `seconds` ticks to 0. */
export function useCountdown(initial = 0) {
  const [seconds, setSeconds] = useState(initial)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }, [])

  const start = useCallback(
    (from: number) => {
      clear()
      setSeconds(from)
      timer.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clear()
            return 0
          }
          return s - 1
        })
      }, 1000)
    },
    [clear],
  )

  useEffect(() => clear, [clear])

  return { seconds, start, active: seconds > 0 }
}
