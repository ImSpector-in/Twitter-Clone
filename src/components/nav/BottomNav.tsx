'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, User } from 'lucide-react'

type Props = {
  username: string
}

export default function BottomNav({ username }: Props) {
  const pathname = usePathname()

  const items = [
    { href: '/home',                  label: 'Home',    icon: Home },
    { href: '/discover',              label: 'Search',  icon: Search },
    { href: `/profile/${username}`,   label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background flex md:hidden z-50" aria-label="Mobile navigation">
      {items.map(({ href, label, icon: Icon }) => {
        const isOwnProfile = href === `/profile/${username}`
        const active = pathname === href || (isOwnProfile && pathname === `/profile/${username}`)
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={`flex-1 flex items-center justify-center py-4 min-h-[44px] transition-colors hover:bg-muted ${active ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon className={`h-6 w-6 ${active ? 'stroke-[2.5px]' : ''}`} />
          </Link>
        )
      })}
    </nav>
  )
}
