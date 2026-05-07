'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createTweet } from '@/lib/actions/tweets'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const MAX = 280

export default function TweetComposer() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const remaining = MAX - content.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || remaining < 0) return

    setLoading(true)
    try {
      await createTweet(content.trim())
      setContent('')
    } catch {
      toast.error('Failed to post tweet. Try again.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="border-b p-4 space-y-3">
      <Textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="resize-none border-none shadow-none focus-visible:ring-0 text-base p-0"
      />
      <div className="flex items-center justify-between">
        <span className={`text-sm ${remaining < 20 ? remaining < 0 ? 'text-destructive font-semibold' : 'text-yellow-500' : 'text-muted-foreground'}`}>
          {remaining}
        </span>
        <Button type="submit" disabled={loading || !content.trim() || remaining < 0} className="rounded-full px-5">
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  )
}
