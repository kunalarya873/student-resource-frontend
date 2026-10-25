import { ArrowLeft, MailCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/ui/otp-input'
import { getApiErrorMessage } from '@/lib/api'
import { useCountdown } from '@/hooks/useCountdown'
import { cn } from '@/lib/utils'

import { authApi } from '../authApi'
import { useAuth } from '../AuthContext'

// Matches the backend's OTP_RESEND_COOLDOWN_SECONDS so the button re-enables
// exactly when a resend will actually be accepted.
const RESEND_COOLDOWN = 60

interface LocationState {
  email?: string
  justSignedUp?: boolean
}

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { establishSession } = useAuth()
  const state = (location.state as LocationState | null) ?? {}
  const email = state.email

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(
    state.justSignedUp ? 'We sent a 6-digit code to your email.' : null,
  )
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const { seconds, start, active } = useCountdown(state.justSignedUp ? RESEND_COOLDOWN : 0)

  useEffect(() => {
    if (state.justSignedUp) start(RESEND_COOLDOWN)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // No email in navigation state → can't verify; send them back to sign in.
  if (!email) return <Navigate to="/login" replace />

  async function verify(fullCode: string) {
    setError(null)
    setSubmitting(true)
    try {
      const res = await authApi.verifyOtp(email!, fullCode)
      if (res.access_token && res.refresh_token) {
        await establishSession({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
        })
        navigate('/', { replace: true })
      } else {
        // Verified but no tokens issued — fall back to a normal sign-in.
        navigate('/login', { replace: true, state: { email } })
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'That code is incorrect or has expired.'))
      setCode('')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    if (active || resending) return
    setError(null)
    setNotice(null)
    setResending(true)
    try {
      await authApi.resendOtp(email!)
      setNotice('A fresh code is on its way to your inbox.')
      start(RESEND_COOLDOWN)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resend the code just yet.'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MailCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we sent to{' '}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
      </div>

      {notice && <Alert variant="info">{notice}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (code.length === 6) void verify(code)
        }}
        className={cn('space-y-5', error && 'animate-shake')}
      >
        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={(c) => void verify(c)}
          disabled={submitting}
          invalid={Boolean(error)}
          autoFocus
          ariaLabel="Email verification code"
        />

        <Button type="submit" className="w-full" loading={submitting} disabled={code.length !== 6}>
          {submitting ? 'Verifying…' : 'Verify and continue'}
        </Button>
      </form>

      <div className="space-y-4 text-center text-sm">
        <p className="text-muted-foreground">
          Didn’t get it?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={active || resending}
            className="font-medium text-primary underline-offset-4 enabled:hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {active ? `Resend in ${seconds}s` : resending ? 'Sending…' : 'Resend code'}
          </button>
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
