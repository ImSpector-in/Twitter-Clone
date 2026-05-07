'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import TweetComposer from './TweetComposer'

type Props = {
  tweetId: string
  replyCount: number
}

export default function ReplyButton({ tweetId, replyCount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-500 transition-colors"
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
