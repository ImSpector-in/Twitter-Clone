'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { createTweet } from '@/lib/actions/tweets'
import { uploadImage } from '@/lib/uploadImage'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ReplyScopeButton, { type ReplyScope } from './ReplyScopeButton'
import EmojiPickerButton from './EmojiPickerButton'
import GifPickerButton from './GifPickerButton'

type Props = {
  avatarUrl: string | null
  displayName: string
}

export default function CompactComposer({ avatarUrl, displayName }: Props) {
  const [content, setContent] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [replyScope, setReplyScope] = useState<ReplyScope>('everyone')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const MAX = 280
  const remaining = MAX - content.length
  const initials = displayName.slice(0, 2).toUpperCase()

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
      await createTweet(content.trim(), undefined, imageUrl ?? undefined, replyScope, gifUrl ?? undefined)
      setContent('')
      setImageUrl(null)
      setGifUrl(null)
      setReplyScope('everyone')
      setExpanded(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post. Try again.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-4 mb-3">
      <div className="flex gap-3 items-start">
        <Avatar className="h-10 w-10 shrink-0 mt-0.5">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-orange-400 text-white font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="What's happening?"
            rows={expanded ? 3 : 1}
            className="w-full bg-transparent border-none outline-none resize-none text-[16px] placeholder:text-muted-foreground/50 leading-relaxed"
          />

          {/* Media preview */}
          {(imageUrl || gifUrl) && (
            <div className="relative inline-block mt-2">
              {imageUrl ? (
                <Image src={imageUrl} alt="Preview" width={300} height={200} className="rounded-xl max-h-40 object-cover border border-border" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={gifUrl!} alt="GIF preview" className="rounded-xl max-h-40 object-cover border border-border" />
              )}
              <button type="button" onClick={() => { setImageUrl(null); setGifUrl(null) }} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black/90">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {expanded && (
            <>
              {/* Reply scope */}
              <div className="mt-3 pt-2 border-t border-border/50">
                <ReplyScopeButton value={replyScope} onChange={setReplyScope} />
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageUploading || !!gifUrl}
                    className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50 p-1 rounded">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <GifPickerButton onSelect={handleGifSelect} />
                  <EmojiPickerButton onInsert={insertEmoji} />
                  <span className={`text-xs tabular-nums ml-1 ${remaining < 20 ? remaining < 0 ? 'text-destructive font-semibold' : 'text-yellow-500' : 'text-muted-foreground'}`}>
                    {remaining}
                  </span>
                </div>
                <button type="submit"
                  disabled={loading || imageUploading || (!content.trim() && !imageUrl && !gifUrl) || remaining < 0}
                  className="px-5 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none">
                  {loading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </>
          )}
        </div>

        {!expanded && (
          <button type="button"
            onClick={() => { setExpanded(true); setTimeout(() => textareaRef.current?.focus(), 50) }}
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shrink-0">
            Post
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
    </form>
  )
}
