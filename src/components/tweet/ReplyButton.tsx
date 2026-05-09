'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import TweetComposer from './TweetComposer'

type Props = {
  tweetId: string
  replyCount: number
  replyScope?: string
  isFollowingOwner?: boolean
  isOwner?: boolean
}

export default function ReplyButton({ tweetId, replyCount, replyScope = 'everyone', isFollowingOwner = false, isOwner = false }: Props) {
  const [open, setOpen] = useState(false)

  const canReply = isOwner ||
    replyScope === 'everyone' ||
    (replyScope === 'followers' && isFollowingOwner)

  if (!canReply) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground/40 cursor-not-allowed">
        <MessageCircle className="h-4 w-4" />
        {replyCount > 0 && <span>{replyCount}</span>}
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-blue-500 transition-colors tabular-nums"
      >
        <MessageCircle className="h-4 w-4" />
        {replyCount > 0 && <span>{replyCount}</span>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Reply</DialogTitle>
          </DialogHeader>
          <TweetComposer
            replyToId={tweetId}
            placeholder="Post your reply..."
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
