import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

import { FormField } from '@/components/form/FormField'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthContext'
import { ShareDialog } from '@/features/sharing/ShareDialog'
import { getApiErrorMessage } from '@/lib/api'

import { driveApi } from './driveApi'

export interface DriveTarget {
  kind: 'folder' | 'resource'
  id: string
  name: string
}

interface DriveActionsValue {
  promptNewFolder: () => void
  promptRename: (item: DriveTarget) => void
  promptDelete: (item: DriveTarget) => void
  promptShare: (item: DriveTarget) => void
}

const DriveActionsContext = createContext<DriveActionsValue | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useDriveActions() {
  return useContext(DriveActionsContext)
}

type ActiveDialog =
  | { type: 'create' }
  | { type: 'rename'; item: DriveTarget }
  | { type: 'delete'; item: DriveTarget }
  | { type: 'share'; item: DriveTarget }
  | null

export function DriveActionsProvider({
  currentFolderId,
  children,
}: {
  currentFolderId: string | null
  children: ReactNode
}) {
  const queryClient = useQueryClient()
  const { refreshProfile } = useAuth()
  const [dialog, setDialog] = useState<ActiveDialog>(null)

  const refreshCurrent = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['drive', currentFolderId ?? 'root'] })
    void queryClient.invalidateQueries({ queryKey: ['sidebar', 'root-folders'] })
  }, [queryClient, currentFolderId])

  const value = useMemo<DriveActionsValue>(
    () => ({
      promptNewFolder: () => setDialog({ type: 'create' }),
      promptRename: (item) => setDialog({ type: 'rename', item }),
      promptDelete: (item) => setDialog({ type: 'delete', item }),
      promptShare: (item) => setDialog({ type: 'share', item }),
    }),
    [],
  )

  const close = () => setDialog(null)

  return (
    <DriveActionsContext.Provider value={value}>
      {children}

      <Dialog open={dialog?.type === 'create'} onOpenChange={(o) => !o && close()}>
        {dialog?.type === 'create' && (
          <CreateFolderDialog
            parentId={currentFolderId}
            onDone={() => {
              refreshCurrent()
              close()
            }}
          />
        )}
      </Dialog>

      <Dialog open={dialog?.type === 'rename'} onOpenChange={(o) => !o && close()}>
        {dialog?.type === 'rename' && (
          <RenameDialog
            item={dialog.item}
            onDone={() => {
              refreshCurrent()
              close()
            }}
          />
        )}
      </Dialog>

      <Dialog open={dialog?.type === 'share'} onOpenChange={(o) => !o && close()}>
        {dialog?.type === 'share' && (
          <ShareDialog resourceId={dialog.item.id} resourceName={dialog.item.name} />
        )}
      </Dialog>

      <Dialog open={dialog?.type === 'delete'} onOpenChange={(o) => !o && close()}>
        {dialog?.type === 'delete' && (
          <DeleteDialog
            item={dialog.item}
            onDone={() => {
              refreshCurrent()
              void refreshProfile()
              close()
            }}
          />
        )}
      </Dialog>
    </DriveActionsContext.Provider>
  )
}

/* ---------------- Create ---------------- */
function CreateFolderDialog({
  parentId,
  onDone,
}: {
  parentId: string | null
  onDone: () => void
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | undefined>()
  const mutation = useMutation({
    mutationFn: (value: string) => driveApi.createFolder(value, parentId),
    onSuccess: onDone,
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Enter a folder name.')
    setError(undefined)
    mutation.mutate(name.trim())
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New folder</DialogTitle>
        <DialogDescription>Create a folder in the current location.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} noValidate>
        <FormField id="folder-name" label="Folder name" error={error}>
          {(aria) => (
            <Input
              {...aria}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Semester 1"
              autoFocus
            />
          )}
        </FormField>
        {mutation.isError && (
          <Alert variant="error" className="mt-3">
            {getApiErrorMessage(mutation.error)}
          </Alert>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create folder
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

/* ---------------- Rename ---------------- */
function RenameDialog({ item, onDone }: { item: DriveTarget; onDone: () => void }) {
  const [name, setName] = useState(item.name)
  const [error, setError] = useState<string | undefined>()
  const mutation = useMutation({
    mutationFn: (value: string) =>
      item.kind === 'folder'
        ? driveApi.renameFolder(item.id, value)
        : driveApi.renameResource(item.id, value),
    onSuccess: onDone,
  })

  const label = item.kind === 'folder' ? 'Folder name' : 'File name'
  const trimmed = name.trim()

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!trimmed) return setError('Name can’t be empty.')
    setError(undefined)
    if (trimmed === item.name) return onDone()
    mutation.mutate(trimmed)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Rename {item.kind === 'folder' ? 'folder' : 'file'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} noValidate>
        <FormField id="rename-input" label={label} error={error}>
          {(aria) => (
            <Input
              {...aria}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          )}
        </FormField>
        {mutation.isError && (
          <Alert variant="error" className="mt-3">
            {getApiErrorMessage(mutation.error)}
          </Alert>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending} disabled={!trimmed}>
            Save
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

/* ---------------- Delete ---------------- */
function DeleteDialog({ item, onDone }: { item: DriveTarget; onDone: () => void }) {
  const isFolder = item.kind === 'folder'
  const mutation = useMutation({
    mutationFn: () =>
      isFolder ? driveApi.deleteFolder(item.id) : driveApi.deleteResource(item.id),
    onSuccess: onDone,
  })

  return (
    <DialogContent className="[--dialog-w:440px]">
      <DialogHeader>
        <DialogTitle>Delete {isFolder ? 'folder' : 'file'}?</DialogTitle>
        <DialogDescription>
          {isFolder ? (
            <>
              <span className="font-medium text-foreground">“{item.name}”</span> and{' '}
              <span className="font-medium text-foreground">everything inside it</span> will be
              permanently deleted. This can’t be undone.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">“{item.name}”</span> will be permanently
              deleted. This can’t be undone.
            </>
          )}
        </DialogDescription>
      </DialogHeader>
      {mutation.isError && <Alert variant="error">{getApiErrorMessage(mutation.error)}</Alert>}
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          loading={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
