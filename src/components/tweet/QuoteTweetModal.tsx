'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { quoteTweet } from '@/lib/actions/retweets'
import { getUserGradient } from '@/lib/utils/avatar'
import { TWEET_MAX_LENGTH } from '@/lib/constants'

type QuotedTweet = {
  id: string
  content: string
  created_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

type Props = {
  open: boolean
  onClose: () => void
  tweet: QuotedTweet
}

export default function QuoteTweetModal({ open, onClose, tweet }: Props) {
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  const profile = tweet.profiles
  const displayName = profile?.display_name || profile?.username || 'Unknown'
  const username = profile?.username || 'unknown'
  const gradient = getUserGradient(username)
  const initials = displayName.slice(0, 2).toUpperCase()
  const remaining = TWEET_MAX_LENGTH - content.length

  async function handlePost() {
    if (!content.trim()) return
    setPosting(true)
    try {
      await quoteTweet(tweet.id, content)
      setContent('')
      onClose()
      toast.success('Quote posted!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to post quote.')
    }
    setPosting(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quote Tweet</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            maxLength={TWEET_MAX_LENGTH}
            rows={3}
            autoFocus
            className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground"
          />

          <div className="rounded-xl border border-border p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white text-[10px] font-semibold`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-xs">{displayName}</span>
              <span className="text-muted-foreground text-xs">@{username}</span>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <span className="text-muted-foreground text-xs">
                {tweet.created_at
                  ? formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })
                  : ''}
              </span>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words line-clamp-4">
              {tweet.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-xs tabular-nums ${remaining < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remaining}
            </span>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim() || remaining < 0}
              className="bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
