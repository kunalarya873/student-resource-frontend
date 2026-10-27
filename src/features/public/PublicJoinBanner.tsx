import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookmarkCheck, BookmarkPlus, Loader2, Sparkles, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/lib/api'

import { publicApi } from './publicApi'

export function PublicJoinBanner({
  shareToken,
  itemName,
  kind,
}: {
  shareToken: string
  itemName: string
  kind: 'folder' | 'resource'
}) {
  const { user, status } = useAuth()
  const queryClient = useQueryClient()
  const isAuthenticated = status === 'authenticated' && user !== null
  const redirectQuery = `?redirect=/s/${encodeURIComponent(shareToken)}`
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const joinMutation = useMutation({
    mutationFn: () => publicApi.join(shareToken),
    onSuccess: (data) => {
      setSuccessMessage(data.message)
      void queryClient.invalidateQueries({ queryKey: ['drive', 'shared-with-me'] })
      void queryClient.invalidateQueries({ queryKey: ['drive', 'shared-folders-with-me'] })
    },
  })

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {isAuthenticated ? `Save “${itemName}” to your account` : 'Join AMU Academic Cloud'}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isAuthenticated
                ? `Add this ${kind} to your 'Shared with Me' library for instant access from your dashboard.`
                : `Create an account or sign in to save this ${kind} directly to your personal AMU cloud drive.`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            successMessage ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <BookmarkCheck className="h-4 w-4" />
                <span>Saved to My Drive</span>
              </div>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
              >
                {joinMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <BookmarkPlus className="h-3.5 w-3.5" />
                )}
                Save to My Drive
              </Button>
            )
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link to={`/login${redirectQuery}`}>Sign In</Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                <Link to={`/signup${redirectQuery}`}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Join & Save
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {joinMutation.isError && (
        <div className="mt-3">
          <Alert variant="error">{getApiErrorMessage(joinMutation.error)}</Alert>
        </div>
      )}
    </div>
  )
}
