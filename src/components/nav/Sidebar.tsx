'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, TrendingUp, Bookmark, User, Settings, LogOut, Feather } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import TweetComposer from '@/components/tweet/TweetComposer'
import NotificationBell from '@/components/notifications/NotificationBell'

type Props = {
  username: string
  userId: string
  unreadCount: number
}

const navItems = (username: string) => [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/discover', label: 'Search', icon: Search },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: `/profile/${username}`, label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ username, userId, unreadCount }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [postOpen, setPostOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <nav className="flex flex-col gap-0.5 p-3 h-full">
        {/* Logo */}
        <Link
          href="/home"
          className="text-2xl font-black px-3 py-2 mb-3 bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent w-fit"
        >
          𝕏
        </Link>

        {navItems(username).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href.includes('/profile/') && pathname.startsWith('/profile/'))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-all w-fit
                ${active
                  ? 'font-bold text-primary border-l-2 border-primary pl-[10px]'
                  : 'font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'stroke-[2.5px]' : ''}`} />
              <span className="hidden xl:inline">{label}</span>
            </Link>
          )
        })}

        <NotificationBell initialCount={unreadCount} userId={userId} />

        {/* Post button with teal gradient */}
        <Button
          onClick={() => setPostOpen(true)}
          className="mt-4 rounded-full xl:w-full w-10 h-10 xl:h-auto p-0 xl:px-5 xl:py-2.5 bg-gradient-to-r from-primary via-cyan-400 to-pink-500 hover:opacity-90 border-0 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:scale-[1.02] text-white font-semibold"
        >
          <Feather className="h-4 w-4 xl:hidden" />
          <span className="hidden xl:inline font-semibold">Post</span>
        </Button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground w-fit text-left mt-auto text-muted-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden xl:inline">Log out</span>
        </button>
      </nav>

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
