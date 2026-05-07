'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createTweet } from '@/lib/actions/tweets'
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
  const remaining = MAX - content.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || remaining < 0) return

    setLoading(true)
    try {
      await createTweet(content.trim(), replyToId)
      setContent('')
      onSuccess?.()
    } catch {
      toast.error('Failed to post tweet. Try again.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'flex items-center gap-2' : 'p-4 space-y-3'}>
      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={compact ? 1 : 3}
        className={`resize-none border-none shadow-none focus-visible:ring-0 p-0 ${compact ? 'text-sm min-h-0' : 'text-base'}`}
      />
      {compact ? (
        <Button type="submit" size="sm" disabled={loading || !content.trim() || remaining < 0} className="rounded-full shrink-0">
          {loading ? '...' : 'Reply'}
        </Button>
      ) : (
        <div className="flex items-center justify-between">
          <span className={`text-sm ${remaining < 20 ? remaining < 0 ? 'text-destructive font-semibold' : 'text-yellow-500' : 'text-muted-foreground'}`}>
            {remaining}
          </span>
          <Button type="submit" disabled={loading || !content.trim() || remaining < 0} className="rounded-full px-5">
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      )}
    </form>
  )
}
