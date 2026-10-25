import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Trash2, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { FormField } from '@/components/form/FormField'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getApiErrorMessage } from '@/lib/api'
import { initials } from '@/lib/format'

import { sharingApi, type SharePermission, type ShareGrant } from './sharingApi'

export function ShareDialog({
  resourceId,
  resourceName,
}: {
  resourceId: string
  resourceName: string
}) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<SharePermission>('VIEW')
  const [fieldError, setFieldError] = useState<string | undefined>()

  const grantsQuery = useQuery({
    queryKey: ['shares', resourceId],
    queryFn: () => sharingApi.list(resourceId),
  })

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['shares', resourceId] })
    void queryClient.invalidateQueries({ queryKey: ['drive', 'shared-by-me'] })
  }

  const shareMutation = useMutation({
    mutationFn: () => sharingApi.share(resourceId, email.trim(), permission),
    onSuccess: () => {
      setEmail('')
      invalidate()
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (accessId: string) => sharingApi.revoke(resourceId, accessId),
    onSuccess: invalidate,
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    const value = email.trim()
    if (!value) return setFieldError('Enter an email address.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setFieldError('Enter a valid email.')
    setFieldError(undefined)
    shareMutation.mutate()
  }

  const grants = grantsQuery.data?.items ?? []

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Share “{resourceName}”</DialogTitle>
        <DialogDescription>Give another user access to this file by email.</DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} noValidate className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <FormField id="share-email" label="Email" error={fieldError}>
              {(aria) => (
                <Input
                  {...aria}
                  type="email"
                  placeholder="person@amu.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              )}
            </FormField>
          </div>
          <div className="w-32 pt-[26px]">
            <Select
              value={permission}
              onChange={(e) => setPermission(e.target.value as SharePermission)}
              aria-label="Permission"
            >
              <option value="VIEW">Viewer</option>
              <option value="EDIT">Editor</option>
            </Select>
          </div>
        </div>

        {shareMutation.isError && (
          <Alert variant="error">{getApiErrorMessage(shareMutation.error)}</Alert>
        )}

        <Button type="submit" className="w-full" loading={shareMutation.isPending}>
          Share
        </Button>
      </form>

      <div className="mt-5 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          People with access
        </p>

        {grantsQuery.isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
        ) : grantsQuery.isError ? (
          <Alert variant="error">Couldn’t load who has access.</Alert>
        ) : grants.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <Users className="h-5 w-5" aria-hidden="true" />
            Not shared with anyone yet.
          </div>
        ) : (
          <ul className="max-h-56 space-y-1 overflow-y-auto">
            {grants.map((g) => (
              <GrantRow
                key={g.access_id}
                grant={g}
                onRevoke={() => revokeMutation.mutate(g.access_id)}
                revoking={revokeMutation.isPending && revokeMutation.variables === g.access_id}
              />
            ))}
          </ul>
        )}
      </div>
    </DialogContent>
  )
}

function GrantRow({
  grant,
  onRevoke,
  revoking,
}: {
  grant: ShareGrant
  onRevoke: () => void
  revoking: boolean
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg px-1 py-1.5">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
        aria-hidden="true"
      >
        {initials(grant.grantee_name || grant.grantee_email)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{grant.grantee_name || grant.grantee_email}</p>
        {grant.grantee_name && (
          <p className="truncate text-xs text-muted-foreground">{grant.grantee_email}</p>
        )}
      </div>
      <Badge tone={grant.permission === 'EDIT' ? 'primary' : 'muted'}>
        {grant.permission === 'EDIT' ? 'Editor' : 'Viewer'}
      </Badge>
      <button
        type="button"
        onClick={onRevoke}
        disabled={revoking}
        aria-label={`Remove ${grant.grantee_email}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {revoking ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </li>
  )
}
