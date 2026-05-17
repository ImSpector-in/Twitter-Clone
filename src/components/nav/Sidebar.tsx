'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/config/nav'

type Props = {
  username: string
  unreadCount: number
  unreadDmCount: number
}

export default function Sidebar({ username, unreadCount, unreadDmCount }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 py-4 px-2">
      {NAV_ITEMS(username).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href === `/profile/${username}` && pathname.startsWith('/profile/') && pathname === `/profile/${username}`)
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
              <Icon className="h-[26px] w-[26px] shrink-0" />
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
