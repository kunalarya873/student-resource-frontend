import * as React from 'react'

import { cn } from '@/lib/utils'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  invalid?: boolean
  autoFocus?: boolean
  ariaLabel?: string
}

/**
 * A segmented numeric code entry. It behaves like one field for the keyboard
 * and clipboard — type to auto-advance, backspace to retreat, paste to fill —
 * while each box stays individually labelled for screen readers.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  invalid = false,
  autoFocus = false,
  ariaLabel = 'Verification code',
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const digits = React.useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ''),
    [value, length],
  )

  function focusBox(index: number) {
    const clamped = Math.max(0, Math.min(length - 1, index))
    refs.current[clamped]?.focus()
    refs.current[clamped]?.select()
  }

  function setValue(next: string) {
    const cleaned = next.replace(/\D/g, '').slice(0, length)
    onChange(cleaned)
    if (cleaned.length === length) onComplete?.(cleaned)
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const chars = digits.slice()
    chars[index] = digit
    const next = chars.join('').slice(0, length)
    setValue(next)
    if (digit) focusBox(index + 1)
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const chars = digits.slice()
      if (chars[index]) {
        chars[index] = ''
        onChange(chars.join(''))
      } else if (index > 0) {
        chars[index - 1] = ''
        onChange(chars.join('').slice(0, index - 1))
        focusBox(index - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusBox(index - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusBox(index + 1)
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    setValue(pasted)
    const filled = pasted.replace(/\D/g, '').slice(0, length).length
    focusBox(filled)
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center justify-between gap-2 sm:gap-3"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digit}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'w-full min-w-0 rounded-md border bg-card text-center text-xl font-semibold text-foreground shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25',
            'disabled:cursor-not-allowed disabled:opacity-60',
            invalid ? 'border-destructive' : 'border-input',
          )}
          style={{ height: '3.25rem' }}
        />
      ))}
    </div>
  )
}
