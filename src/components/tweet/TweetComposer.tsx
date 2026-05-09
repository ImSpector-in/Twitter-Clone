'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { createTweet } from '@/lib/actions/tweets'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const MAX = 280

type Props = {
  onSuccess?: () => void
  replyToId?: string
  placeholder?: string
  compact?: boolean
}

export default function TweetComposer({ onSuccess, replyToId, placeholder = "What's happening?", compact = false }: Props = {}) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const remaining = MAX - content.length

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setImageUploading(true)
    const supabase = createClient()
    // Sanitize extension — only allow known image types, never trust filename
    const rawExt = file.name.split('.').pop()?.toLowerCase() ?? ''
    const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(rawExt) ? rawExt : 'jpg'
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`

    const { error } = await supabase.storage.from('tweet-images').upload(path, file)

    if (error) {
      toast.error('Image upload failed')
      setImageUploading(false)
      return
    }

    const { data } = supabase.storage.from('tweet-images').getPublicUrl(path)
    setImageUrl(data.publicUrl)
    setImageUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || remaining < 0) return

    setLoading(true)
    try {
      await createTweet(content.trim(), replyToId, imageUrl ?? undefined)
      setContent('')
      setImageUrl(null)
      onSuccess?.()
    } catch {
      toast.error('Failed to post. Try again.')
    }
    setLoading(false)
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={1}
          className="resize-none border-none shadow-none focus-visible:ring-0 p-0 text-sm min-h-0"
        />
        <Button type="submit" size="sm" disabled={loading || !content.trim() || remaining < 0} className="rounded-full shrink-0">
          {loading ? '...' : 'Reply'}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-4 space-y-3 mb-3">
      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="resize-none border-none shadow-none focus-visible:ring-0 text-base p-0"
      />

      {/* Image preview */}
      {imageUrl && (
        <div className="relative inline-block">
          <Image
            src={imageUrl}
            alt="Upload preview"
            width={300}
            height={200}
            className="rounded-xl object-cover max-h-48 w-auto"
          />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <span className={`text-sm ${remaining < 20 ? remaining < 0 ? 'text-destructive font-semibold' : 'text-yellow-500' : 'text-muted-foreground'}`}>
            {remaining}
          </span>
        </div>
        <Button type="submit" disabled={loading || imageUploading || (!content.trim() && !imageUrl) || remaining < 0} className="rounded-full px-5">
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </form>
  )
}
