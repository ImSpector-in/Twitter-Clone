'use client'

import { useState, useEffect } from 'react'
import { Repeat2, Quote } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { retweet } from '@/lib/actions/retweets'
import QuoteTweetModal from './QuoteTweetModal'

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

export default function RetweetButton({ tweetId, initialRetweeted, initialCount, quotedTweet }: {
  tweetId: string
  initialRetweeted: boolean
  initialCount: number
  quotedTweet: QuotedTweet
}) {
  const [retweeted, setRetweeted] = useState(initialRetweeted)
  const [count, setCount] = useState(initialCount)
  const [quoteOpen, setQuoteOpen] = useState(false)

  useEffect(() => {
    setRetweeted(initialRetweeted)
    setCount(initialCount)
  }, [initialRetweeted, initialCount])

  async function handleRepost() {
    setRetweeted((prev) => !prev)
    setCount((prev) => retweeted ? prev - 1 : prev + 1)
    try {
      await retweet(tweetId)
    } catch {
      setRetweeted((prev) => !prev)
      setCount((prev) => retweeted ? prev + 1 : prev - 1)
      toast.error('Failed to repost.')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-1 text-xs transition-colors group-hover:text-green-500 tabular-nums ${retweeted ? 'text-green-500' : 'text-muted-foreground'}`}
          >
            <Repeat2 className="h-4 w-4" />
            {count > 0 && <span>{count}</span>}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem onClick={handleRepost} className="gap-2 cursor-pointer">
            <Repeat2 className="h-4 w-4" />
            {retweeted ? 'Undo repost' : 'Repost'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setQuoteOpen(true)} className="gap-2 cursor-pointer">
            <Quote className="h-4 w-4" />
            Quote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <QuoteTweetModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        tweet={quotedTweet}
      />
    </>
  )
}
