import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { FormField } from '@/components/form/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { getApiErrorMessage } from '@/lib/api'
import { isEmail, passwordIssue } from '@/lib/validation'

import { authApi } from '../authApi'

export function SignupPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const next: Record<string, string> = {}
    if (!fullName.trim()) next.fullName = 'Enter your full name.'
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!isEmail(email)) next.email = 'That doesn’t look like a valid email.'
    const pwIssue = passwordIssue(password)
    if (pwIssue) next.password = pwIssue
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await authApi.signup({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      })
      navigate('/verify-otp', { state: { email: email.trim(), justSignedUp: true } })
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not create your account.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Join to store and share your course materials.
        </p>
      </div>

      {formError && <Alert variant="error">{formError}</Alert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField id="fullName" label="Full name" error={fieldErrors.fullName}>
          {(aria) => (
            <Input
              {...aria}
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoFocus
            />
          )}
        </FormField>

        <FormField id="email" label="Email" error={fieldErrors.email}>
          {(aria) => (
            <Input
              {...aria}
              type="email"
              autoComplete="email"
              placeholder="you@amu.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={fieldErrors.password}
          hint="At least 8 characters."
        >
          {(aria) => (
            <PasswordInput
              {...aria}
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </FormField>

        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
