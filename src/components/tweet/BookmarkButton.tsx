'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { toggleBookmark } from '@/lib/actions/bookmarks'

export default function BookmarkButton({ tweetId, initialBookmarked }: { tweetId: string; initialBookmarked: boolean }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)

  async function handleClick() {
    setBookmarked((prev) => !prev)
    try {
      await toggleBookmark(tweetId)
    } catch {
      setBookmarked((prev) => !prev)
      toast.error('Failed to bookmark.')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 text-xs transition-colors hover:text-primary ${bookmarked ? 'text-primary' : 'text-muted-foreground'}`}
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-primary' : ''}`} />
    </button>
  )
}
