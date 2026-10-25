import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Link2,
  Presentation,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface FileTypeIconProps {
  contentType: string | null
  isExternal?: boolean
  className?: string
}

function pick(contentType: string | null, isExternal?: boolean) {
  if (isExternal) return { Icon: Link2, tint: 'text-sky-600 bg-sky-50' }
  const ct = (contentType ?? '').toLowerCase()
  if (ct.startsWith('image/')) return { Icon: FileImage, tint: 'text-violet-600 bg-violet-50' }
  if (ct.startsWith('audio/')) return { Icon: FileAudio, tint: 'text-amber-600 bg-amber-50' }
  if (ct.startsWith('video/')) return { Icon: FileVideo, tint: 'text-rose-600 bg-rose-50' }
  if (ct.includes('pdf')) return { Icon: FileText, tint: 'text-red-600 bg-red-50' }
  if (ct.includes('zip') || ct.includes('tar') || ct.includes('rar') || ct.includes('compressed'))
    return { Icon: FileArchive, tint: 'text-orange-600 bg-orange-50' }
  if (ct.includes('sheet') || ct.includes('excel') || ct.includes('csv'))
    return { Icon: FileSpreadsheet, tint: 'text-emerald-600 bg-emerald-50' }
  if (ct.includes('presentation') || ct.includes('powerpoint'))
    return { Icon: Presentation, tint: 'text-amber-700 bg-amber-50' }
  if (ct.includes('word') || ct.includes('document') || ct.startsWith('text/'))
    return { Icon: FileText, tint: 'text-blue-600 bg-blue-50' }
  return { Icon: File, tint: 'text-slate-500 bg-slate-100' }
}

export function FileTypeIcon({ contentType, isExternal, className }: FileTypeIconProps) {
  const { Icon, tint } = pick(contentType, isExternal)
  return (
    <span
      className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', tint, className)}
      aria-hidden="true"
    >
      <Icon className="h-[18px] w-[18px]" />
    </span>
  )
}
