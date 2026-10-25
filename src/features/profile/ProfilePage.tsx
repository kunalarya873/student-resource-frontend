import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { FormField } from '@/components/form/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/features/auth/AuthContext'
import { departmentsApi } from '@/features/profile/departmentsApi'
import { usersApi, type UpdateProfilePayload } from '@/features/profile/usersApi'
import { getApiErrorMessage } from '@/lib/api'

export function ProfilePage() {
  const queryClient = useQueryClient()
  const { refreshProfile } = useAuth()

  const { data: account, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.me,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.list,
    staleTime: 5 * 60_000,
  })

  const [fullName, setFullName] = useState('')
  const [deptId, setDeptId] = useState<number | null>(null)
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [saved, setSaved] = useState(false)

  // Seed the editable fields once the account loads.
  useEffect(() => {
    if (account) {
      setFullName(account.full_name)
      setDeptId(account.department_id)
    }
  }, [account])

  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => usersApi.updateMe(payload),
    onSuccess: async (updated) => {
      queryClient.setQueryData(['users', 'me'], updated)
      await refreshProfile() // keep the app header's name in sync
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground" role="status">
        Loading your profile…
      </div>
    )

  if (isError || !account) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-20 text-center">
        <Alert variant="error">We couldn’t load your profile.</Alert>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
        <Link to="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          Back to My Drive
        </Link>
      </div>
    )
  }

  const trimmed = fullName.trim()
  const nameChanged = trimmed !== account.full_name
  const deptChanged = deptId !== account.department_id
  const dirty = nameChanged || deptChanged
  const memberSince = new Date(account.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function resetForm() {
    if (!account) return
    setFullName(account.full_name)
    setDeptId(account.department_id)
    setFieldError(undefined)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaved(false)
    if (!trimmed) return setFieldError('Your name can’t be empty.')
    setFieldError(undefined)

    const payload: UpdateProfilePayload = {}
    if (nameChanged) payload.full_name = trimmed
    if (deptChanged) payload.department_id = deptId
    mutation.mutate(payload)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-medium tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account details.</p>
      </div>

      <Card>
          <CardHeader>
            <CardTitle className="text-base">Your details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FormField id="full_name" label="Full name" error={fieldError}>
                {(aria) => (
                  <Input
                    {...aria}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                  />
                )}
              </FormField>

              <FormField id="department" label="Department">
                {(aria) => (
                  <Select
                    {...aria}
                    value={deptId === null ? '' : String(deptId)}
                    onChange={(e) =>
                      setDeptId(e.target.value === '' ? null : Number(e.target.value))
                    }
                  >
                    <option value="">No department</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>

              {mutation.isError && (
                <Alert variant="error">{getApiErrorMessage(mutation.error)}</Alert>
              )}
              {saved && (
                <Alert variant="success">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4" aria-hidden="true" /> Profile updated
                  </span>
                </Alert>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" loading={mutation.isPending} disabled={!dirty}>
                  {mutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
                {dirty && !mutation.isPending && (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            <div className="space-y-2.5 border-t border-border pt-5 text-sm">
              <Row label="Email" value={account.email} />
              <Row label="Role" value={account.role_name} />
              <Row label="Status" value={account.status} />
              <Row label="Member since" value={memberSince} />
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  )
}
