'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, User, Settings, LogOut, Feather } from 'lucide-react'
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
      <nav className="flex flex-col gap-1 p-3 h-full">
        <Link href="/home" className="text-2xl font-bold px-3 py-2 mb-2">𝕏</Link>

        {navItems(username).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href.includes('/profile/') && pathname.startsWith('/profile/'))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-base transition-colors hover:bg-muted w-fit ${active ? 'font-bold' : 'font-medium'}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden xl:inline">{label}</span>
            </Link>
          )
        })}

        <NotificationBell initialCount={unreadCount} userId={userId} />

        <Button
          onClick={() => setPostOpen(true)}
          className="mt-3 rounded-full xl:w-full w-10 h-10 xl:h-auto p-0 xl:px-5 xl:py-2.5"
        >
          <Feather className="h-4 w-4 xl:hidden" />
          <span className="hidden xl:inline">Post</span>
        </Button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-full text-base font-medium transition-colors hover:bg-muted w-fit text-left mt-auto"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden xl:inline">Log out</span>
        </button>
      </nav>

      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New post</DialogTitle>
          </DialogHeader>
          <TweetComposer onSuccess={() => setPostOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
