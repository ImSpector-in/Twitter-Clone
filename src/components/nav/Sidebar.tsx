'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, TrendingUp, Bookmark, User, Settings, MessageSquare } from 'lucide-react'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

type Props = {
  username: string
  unreadCount: number
  unreadDmCount: number
}

const navItems = (username: string) => [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/discover', label: 'Search', icon: Search },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: `/profile/${username}`, label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ username, unreadCount, unreadDmCount }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 py-4 px-2">
      <Link href="/home" className="flex items-center gap-2 px-4 py-3 mb-1">
        <QuotoraLogo size={30} />
        <span className="font-bold text-lg tracking-tight">Quotora</span>
      </Link>
      {navItems(username).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href.includes('/profile/') && pathname.startsWith('/profile/'))
        const isNotifications = href === '/notifications'
        const isMessages = href === '/messages'
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-xl transition-colors duration-150
              ${active
                ? 'font-bold text-foreground bg-accent'
                : 'font-normal text-muted-foreground hover:text-foreground hover:bg-accent/60'
              }`}
          >
            <div className="relative">
              <Icon className={`h-[26px] w-[26px] shrink-0`} />
              {isNotifications && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {isMessages && unreadDmCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                  {unreadDmCount > 9 ? '9+' : unreadDmCount}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
