import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

const TOKEN_REGEX = /(https?:\/\/[^\s<>"']+|#\w+)/g

export function renderWithHashtags(content: string, linkStatus?: string | null) {
  const parts = content.split(TOKEN_REGEX)

  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      return (
        <Link
          key={i}
          href={`/hashtag/${part.slice(1).toLowerCase()}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      )
    }

    if (part.match(/^https?:\/\//)) {
      // Trim trailing punctuation that got caught by the regex
      const url = part.replace(/[.,!?;:)]+$/, '')

      if (linkStatus === 'flagged') {
        // Flagged — render as plain non-clickable text so the user can't accidentally visit it
        return (
          <span key={i} className="text-muted-foreground line-through text-sm" title="Link removed — flagged as unsafe">
            {url}
          </span>
        )
      }

      return (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-primary hover:underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {url}
        </a>
      )
    }

    return part
  })
}

export function LinkFlaggedBanner() {
  return (
    <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
      <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
      <span>A link in this post was flagged as potentially unsafe and has been disabled.</span>
    </div>
  )
}
