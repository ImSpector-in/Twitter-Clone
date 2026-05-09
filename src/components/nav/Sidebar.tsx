'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, TrendingUp, Bookmark, User, Settings } from 'lucide-react'

type Props = {
  username: string
  unreadCount: number
}

const navItems = (username: string) => [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/discover', label: 'Search', icon: Search },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: `/profile/${username}`, label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ username, unreadCount }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5 py-4 px-2">
      {navItems(username).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href.includes('/profile/') && pathname.startsWith('/profile/'))
        const isNotifications = href === '/notifications'
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] transition-colors duration-150
              ${active
                ? 'font-semibold text-foreground bg-accent'
                : 'font-normal text-muted-foreground hover:text-foreground hover:bg-accent/60'
              }`}
          >
            <div className="relative">
              <Icon className={`h-[18px] w-[18px] shrink-0`} />
              {isNotifications && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
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
