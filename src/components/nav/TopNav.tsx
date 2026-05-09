'use client'

import Link from 'next/link'
import { Search, Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import TweetComposer from '@/components/tweet/TweetComposer'

type Props = {
  username: string
  displayName: string
  avatarUrl: string | null
}

export default function TopNav({ username, displayName, avatarUrl }: Props) {
  const [postOpen, setPostOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const initials = displayName.slice(0, 2).toUpperCase()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/discover?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-black text-sm">
              𝕏
            </div>
            <span className="font-bold text-base hidden sm:block">Wavr</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-4 rounded-full bg-muted border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              onClick={() => setPostOpen(true)}
              className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post</span>
            </button>
            <Link href={`/profile/${username}`}>
              <Avatar className="h-8 w-8 ring-2 ring-border cursor-pointer hover:ring-primary transition-all">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-pink-500 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">New post</DialogTitle>
          </DialogHeader>
          <TweetComposer onSuccess={() => setPostOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
