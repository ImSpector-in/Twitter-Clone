'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { searchTweets } from '@/lib/actions/search'

type Tweet = {
  id: string
  content: string
  created_at: string
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
}

export default function TweetSearch({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    // Q-010: Server-side search with block/mute exclusions
    const data = await searchTweets(value.trim())
    setResults(data)
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <Input
        placeholder="Search tweets..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        autoFocus
      />
      {loading && <p className="text-sm text-muted-foreground">Searching...</p>}
      {searched && results.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">No tweets found for &quot;{query}&quot;</p>
      )}
      {results.length > 0 && (
        <ul className="space-y-1">
          {results.map((tweet) => {
            const profile = tweet.profiles
            const displayName = profile?.display_name || profile?.username || 'Unknown'
            return (
              <li key={tweet.id}>
                <Link
                  href={`/tweet/${tweet.id}`}
                  className="flex gap-3 rounded-xl border px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-semibold">{displayName}</span>
                      <span className="text-muted-foreground">@{profile?.username}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tweet.content}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
