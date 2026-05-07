'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import FollowButton from '@/components/profile/FollowButton'
import Link from 'next/link'

type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  isFollowing: boolean
}

export default function UserSearch({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(value: string) {
    setQuery(value)

    if (value.trim().length < 1) {
      setResults([])
      setSearched(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const [profilesResult, followsResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, bio')
        .or(`username.ilike.%${value.trim()}%,display_name.ilike.%${value.trim()}%`)
        .neq('id', currentUserId)
        .limit(10),
      supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId),
    ])

    const followingIds = new Set(followsResult.data?.map((f) => f.following_id) ?? [])
    const profiles = (profilesResult.data ?? []).map((p) => ({
      ...p,
      isFollowing: followingIds.has(p.id),
    }))

    setResults(profiles)
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      <Input
        placeholder="Search by username..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        autoFocus
      />
      {loading && <p className="text-sm text-muted-foreground">Searching...</p>}
      {searched && results.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">No users found for &quot;{query}&quot;</p>
      )}
      {results.length > 0 && (
        <ul className="space-y-1">
          {results.map((profile) => {
            const displayName = profile.display_name || profile.username
            const initials = displayName.slice(0, 2).toUpperCase()
            return (
              <li key={profile.id} className="flex items-center justify-between rounded-xl border px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${profile.username}`} className="font-semibold text-sm hover:underline">
                      {displayName}
                    </Link>
                    <p className="text-muted-foreground text-sm">@{profile.username}</p>
                    {profile.bio && <p className="text-xs text-muted-foreground line-clamp-1">{profile.bio}</p>}
                  </div>
                </div>
                <FollowButton
                  targetUserId={profile.id}
                  targetUsername={profile.username}
                  initialIsFollowing={profile.isFollowing}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
