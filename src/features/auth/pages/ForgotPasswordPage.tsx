import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { FormField } from '@/components/form/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OtpInput } from '@/components/ui/otp-input'
import { PasswordInput } from '@/components/ui/password-input'
import { useCountdown } from '@/hooks/useCountdown'
import { getApiErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import { isEmail, passwordIssue } from '@/lib/validation'

import { authApi } from '../authApi'

const RESEND_COOLDOWN = 60
type Step = 'request' | 'reset' | 'done'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('request')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const { seconds, start, active } = useCountdown(0)

  // --- Step 1: request a reset code ---------------------------------------
  async function requestCode(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!email.trim()) return setFieldErrors({ email: 'Enter your email address.' })
    if (!isEmail(email)) return setFieldErrors({ email: 'That doesn’t look like a valid email.' })
    setFieldErrors({})

    setSubmitting(true)
    try {
      await authApi.forgotPassword(email.trim())
      setNotice('If that account exists, a 6-digit reset code is on its way.')
      setStep('reset')
      start(RESEND_COOLDOWN)
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // --- Step 2: submit code + new password ---------------------------------
  function validateReset() {
    const next: Record<string, string> = {}
    if (code.length !== 6) next.code = 'Enter the 6-digit code.'
    const pwIssue = passwordIssue(password)
    if (pwIssue) next.password = pwIssue
    if (confirm !== password) next.confirm = 'Passwords don’t match.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function submitReset(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validateReset()) return

    setSubmitting(true)
    try {
      await authApi.resetPassword(email.trim(), code, password)
      setStep('done')
      setTimeout(() => navigate('/login', { replace: true, state: { email: email.trim() } }), 1800)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'That code is incorrect or has expired.'))
      setCode('')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    if (active || resending) return
    setFormError(null)
    setResending(true)
    try {
      await authApi.forgotPassword(email.trim())
      setNotice('A fresh reset code is on its way.')
      start(RESEND_COOLDOWN)
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
          <p className="text-sm text-muted-foreground">
            Taking you to sign in with your new password…
          </p>
        </div>
      </div>
    )
  }

  if (step === 'reset') {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Enter your reset code</h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-foreground">{email}</span>.{' '}
              <button
                type="button"
                onClick={() => {
                  setStep('request')
                  setCode('')
                  setNotice(null)
                  setFormError(null)
                }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Change
              </button>
            </p>
          </div>
        </div>

        {notice && <Alert variant="info">{notice}</Alert>}
        {formError && <Alert variant="error">{formError}</Alert>}

        <form onSubmit={submitReset} noValidate className={cn('space-y-4', formError && 'animate-shake')}>
          <div className="space-y-1.5">
            <OtpInput
              value={code}
              onChange={setCode}
              disabled={submitting}
              invalid={Boolean(fieldErrors.code)}
              autoFocus
              ariaLabel="Password reset code"
            />
            {fieldErrors.code && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {fieldErrors.code}
              </p>
            )}
          </div>

          <FormField
            id="password"
            label="New password"
            error={fieldErrors.password}
            hint="At least 8 characters."
          >
            {(aria) => (
              <PasswordInput
                {...aria}
                autoComplete="new-password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
          </FormField>

          <FormField id="confirm" label="Confirm password" error={fieldErrors.confirm}>
            {(aria) => (
              <PasswordInput
                {...aria}
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            )}
          </FormField>

          <Button type="submit" className="w-full" loading={submitting}>
            {submitting ? 'Updating…' : 'Reset password'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
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
      </div>
    )
  }

  // step === 'request'
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we’ll send you a 6-digit code to set a new password.
        </p>
      </div>

      {formError && <Alert variant="error">{formError}</Alert>}

      <form onSubmit={requestCode} noValidate className="space-y-4">
        <FormField id="email" label="Email" error={fieldErrors.email}>
          {(aria) => (
            <Input
              {...aria}
              type="email"
              autoComplete="email"
              placeholder="you@amu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          )}
        </FormField>

        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? 'Sending…' : 'Send reset code'}
        </Button>
      </form>

      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to sign in
      </Link>
    </div>
  )
}
