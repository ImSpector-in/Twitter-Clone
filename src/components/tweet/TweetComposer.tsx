'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { createTweet } from '@/lib/actions/tweets'
import { uploadImage } from '@/lib/uploadImage'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ReplyScopeButton, { type ReplyScope } from './ReplyScopeButton'
import EmojiPickerButton from './EmojiPickerButton'
import GifPickerButton from './GifPickerButton'

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
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [replyScope, setReplyScope] = useState<ReplyScope>('everyone')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const remaining = MAX - content.length

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }

    setImageUploading(true)
    try {
      const url = await uploadImage(file, 'tweet-images')
      setImageUrl(url)
      setGifUrl(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed')
    }
    setImageUploading(false)
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) { setContent(c => c + emoji); return }
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = content.slice(0, start) + emoji + content.slice(end)
    setContent(next)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + emoji.length
      el.focus()
    })
  }

  function handleGifSelect(url: string) {
    setGifUrl(url)
    setImageUrl(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if ((!content.trim() && !imageUrl && !gifUrl) || remaining < 0) return

    setLoading(true)
    try {
      await createTweet(content.trim(), replyToId, imageUrl ?? undefined, replyScope, gifUrl ?? undefined)
      setContent('')
      setImageUrl(null)
      setGifUrl(null)
      setReplyScope('everyone')
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post. Try again.')
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="resize-none border-none shadow-none focus-visible:ring-0 text-base p-0 bg-transparent"
      />

      {/* Media preview */}
      {(imageUrl || gifUrl) && (
        <div className="relative inline-block">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Upload preview"
              width={300}
              height={200}
              className="rounded-xl object-cover max-h-48 w-auto"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gifUrl!}
              alt="GIF preview"
              className="rounded-xl max-h-48 w-auto object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => { setImageUrl(null); setGifUrl(null) }}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Reply scope — only shown on new posts, not replies */}
      {!replyToId && (
        <div className="border-t border-border/40 pt-2">
          <ReplyScopeButton value={replyScope} onChange={setReplyScope} />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading || !!gifUrl}
            className="text-muted-foreground hover:text-primary transition-colors p-1 rounded disabled:opacity-40"
            title="Photo"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <GifPickerButton onSelect={handleGifSelect} />
          <EmojiPickerButton onInsert={insertEmoji} />
          <span className={`text-sm ml-2 tabular-nums ${remaining < 20 ? remaining < 0 ? 'text-destructive font-semibold' : 'text-yellow-500' : 'text-muted-foreground'}`}>
            {remaining}
          </span>
        </div>
        <Button
          type="submit"
          disabled={loading || imageUploading || (!content.trim() && !imageUrl && !gifUrl) || remaining < 0}
          className="rounded-full px-5"
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
    </form>
  )
}
