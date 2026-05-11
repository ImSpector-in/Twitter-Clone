'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { updateAvatarUrl } from '@/lib/actions/profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type Props = {
  userId: string
  currentAvatarUrl: string | null
  displayName: string
  onUpload?: (url: string) => void
}

export default function AvatarUpload({ userId, currentAvatarUrl, displayName, onUpload }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }

    setUploading(true)

    // Q-008 + Q-025: Upload through server-side route for magic byte validation + random UUID path
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'avatars')

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error ?? 'Upload failed')
      setUploading(false)
      return
    }

    try {
      await updateAvatarUrl(json.url)
      setAvatarUrl(json.url)
      onUpload?.(json.url)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save avatar.')
    }

    setUploading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading...' : 'Change photo'}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP · Max 2MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
