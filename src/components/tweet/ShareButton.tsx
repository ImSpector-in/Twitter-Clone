'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ShareButton({ tweetId }: { tweetId: string }) {
  async function handleShare() {
    const url = `${window.location.origin}/tweet/${tweetId}`

    if (navigator.share) {
      try {
        await navigator.share({ url })
      } catch {
        // user cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-blue-400 transition-colors"
    >
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline text-xs">Share</span>
    </button>
  )
}
