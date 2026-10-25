import { AxiosError } from 'axios'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { FormField } from '@/components/form/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { getApiErrorMessage } from '@/lib/api'
import { isEmail } from '@/lib/validation'

import { authApi } from '../authApi'
import { useAuth } from '../AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { establishSession } = useAuth()

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next: typeof fieldErrors = {}
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!isEmail(email)) next.email = 'That doesn’t look like a valid email.'
    if (!password) next.password = 'Enter your password.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      const tokens = await authApi.login(email.trim(), password)
      await establishSession(tokens)
      navigate(from, { replace: true })
    } catch (err) {
      // Unverified accounts are sent to finish OTP verification instead of a dead end.
      if (err instanceof AxiosError && err.response?.status === 403) {
        navigate('/verify-otp', { state: { email: email.trim() }, replace: true })
        return
      }
      setFormError(getApiErrorMessage(err, 'Incorrect email or password.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to reach your files and shared resources.
        </p>
      </div>

      {formError && <Alert variant="error">{formError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

        <FormField id="password" label="Password" error={fieldErrors.password}>
          {(aria) => (
            <PasswordInput
              {...aria}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
