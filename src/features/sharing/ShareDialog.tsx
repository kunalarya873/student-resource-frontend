import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Globe, Link2, Loader2, Lock, Trash2, Users } from 'lucide-react'
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

import { shareClientFor, type ShareKind, type SharePermission, type ShareGrant } from './sharingApi'

export function ShareDialog({
  targetId,
  targetName,
  kind,
}: {
  targetId: string
  targetName: string
  kind: ShareKind
}) {
  const queryClient = useQueryClient()
  const client = shareClientFor(kind)
  const noun = kind === 'folder' ? 'folder' : 'file'
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<SharePermission>('VIEW')
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [copied, setCopied] = useState(false)

  const grantsQuery = useQuery({
    queryKey: ['shares', kind, targetId],
    queryFn: () => client.list(targetId),
  })

  const publicLinkQuery = useQuery({
    queryKey: ['public-link', kind, targetId],
    queryFn: () => client.getPublicLink(targetId),
  })

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['shares', kind, targetId] })
    void queryClient.invalidateQueries({ queryKey: ['public-link', kind, targetId] })
    void queryClient.invalidateQueries({ queryKey: ['drive', 'shared-by-me'] })
    void queryClient.invalidateQueries({ queryKey: ['drive', 'shared-folders-with-me'] })
    void queryClient.invalidateQueries({ queryKey: ['drive'] })
  }

  const shareMutation = useMutation({
    mutationFn: () => client.share(targetId, email.trim(), permission),
    onSuccess: () => {
      setEmail('')
      invalidate()
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (accessId: string) => client.revoke(targetId, accessId),
    onSuccess: invalidate,
  })

  const togglePublicMutation = useMutation({
    mutationFn: (isPublic: boolean) => client.togglePublicLink(targetId, isPublic),
    onSuccess: (updated) => {
      queryClient.setQueryData(['public-link', kind, targetId], updated)
      invalidate()
    },
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
  const publicLink = publicLinkQuery.data
  const isPublic = Boolean(publicLink?.is_public)
  const fullShareUrl = publicLink?.share_token
    ? `${window.location.origin}/s/${publicLink.share_token}`
    : ''

  function copyPublicLink() {
    if (!fullShareUrl) return
    navigator.clipboard.writeText(fullShareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold tracking-tight">Share “{targetName}”</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {kind === 'folder'
            ? 'Invite collaborators by email or make this folder publicly joinable via link.'
            : `Invite collaborators by email or make this ${noun} publicly accessible via link.`}
        </DialogDescription>
      </DialogHeader>

      {/* Invite by Email */}
      <form onSubmit={submit} noValidate className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <FormField id="share-email" label="Add people by email" error={fieldError}>
              {(aria) => (
                <Input
                  {...aria}
                  type="email"
                  placeholder="student@amu.edu"
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
          Invite
        </Button>
      </form>

      {/* General Access / Public Link Section */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            General Access
          </p>
          {isPublic && (
            <Badge tone="primary" className="text-[11px] font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Public Link Active
            </Badge>
          )}
        </div>

        <div className="mt-2.5 rounded-lg border border-border/80 bg-muted/20 p-3">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                isPublic
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-secondary text-muted-foreground'
              }`}
              aria-hidden="true"
            >
              {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <Select
                  value={isPublic ? 'public' : 'restricted'}
                  onChange={(e) => togglePublicMutation.mutate(e.target.value === 'public')}
                  disabled={togglePublicMutation.isPending}
                  aria-label="General Access Level"
                  className="h-8 py-1 text-xs font-medium"
                >
                  <option value="restricted">Restricted (Only invited people)</option>
                  <option value="public">Anyone with the link (Public)</option>
                </Select>
                {togglePublicMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
                )}
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {isPublic
                  ? `Anyone with this link can view, browse contents, download, and join this ${noun}.`
                  : `Only accounts explicitly added above can access this ${noun}.`}
              </p>

              {togglePublicMutation.isError && (
                <Alert variant="error" className="mt-2 text-xs">
                  {getApiErrorMessage(togglePublicMutation.error)}
                </Alert>
              )}

              {publicLinkQuery.isError && (
                <Alert variant="error" className="mt-2 text-xs">
                  Failed to fetch link status: {getApiErrorMessage(publicLinkQuery.error)}
                </Alert>
              )}

              {isPublic && fullShareUrl && (
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      readOnly
                      value={fullShareUrl}
                      className="h-8 truncate pr-8 font-mono text-[11px] text-muted-foreground selection:bg-primary/20"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Link2 className="absolute right-2.5 top-2 h-4 w-4 text-muted-foreground/60" />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={copied ? 'secondary' : 'outline'}
                    onClick={copyPublicLink}
                    className="h-8 gap-1.5 px-3 text-xs font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* People with access list */}
      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          People with direct access
        </p>

        {grantsQuery.isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          </div>
        ) : grantsQuery.isError ? (
          <Alert variant="error">Couldn’t load who has access.</Alert>
        ) : grants.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-4 text-center text-xs text-muted-foreground">
            <Users className="h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
            No individual email grants yet.
          </div>
        ) : (
          <ul className="max-h-48 space-y-1 overflow-y-auto">
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
    <li className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/30">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
        aria-hidden="true"
      >
        {initials(grant.grantee_name || grant.grantee_email)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{grant.grantee_name || grant.grantee_email}</p>
        {grant.grantee_name && (
          <p className="truncate text-[11px] text-muted-foreground">{grant.grantee_email}</p>
        )}
      </div>
      <Badge tone={grant.permission === 'EDIT' ? 'primary' : 'muted'} className="text-[10px]">
        {grant.permission === 'EDIT' ? 'Editor' : 'Viewer'}
      </Badge>
      <button
        type="button"
        onClick={onRevoke}
        disabled={revoking}
        aria-label={`Remove ${grant.grantee_email}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {revoking ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </li>
  )
}
