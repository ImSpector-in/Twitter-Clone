'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, User } from 'lucide-react'

type Props = {
  username: string
}

const navItems = (username: string) => [
  { href: '/home', icon: Home },
  { href: '/discover', icon: Search },
  { href: `/profile/${username}`, icon: User },
]

export default function BottomNav({ username }: Props) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background flex md:hidden z-50">
      {navItems(username).map(({ href, icon: Icon }) => {
        const active = pathname === href || (href.includes('/profile/') && pathname.startsWith('/profile/'))
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex items-center justify-center py-3 transition-colors hover:bg-muted ${active ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Icon className={`h-6 w-6 ${active ? 'stroke-[2.5px]' : ''}`} />
          </Link>
        )
      })}
    </nav>
  )
}
