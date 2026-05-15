'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, TrendingUp, Bookmark, Bell, User, Settings, LogOut, MessageSquare } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

type Props = {
  username: string
  displayName: string
  avatarUrl: string | null
  unreadCount: number
  unreadDmCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navItems = (username: string) => [
  { href: `/profile/${username}`, label: 'Profile', icon: User },
  { href: '/home', label: 'Home', icon: Home },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/discover', label: 'Search', icon: Search },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileMenu({ username, displayName, avatarUrl, unreadCount, unreadDmCount, open, onOpenChange }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">
              <div className="flex items-center gap-2 mb-3">
                <QuotoraLogo size={26} />
                <span className="font-bold">Quotora</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-orange-400 text-white">
                    {initials}
                  </AvatarFallback>
                  <AvatarImage src={avatarUrl ?? undefined} />
                </Avatar>
                <div>
                  <p className="font-bold text-sm">{displayName}</p>
                  <p className="text-muted-foreground text-xs">@{username}</p>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col p-3 gap-0.5">
            {navItems(username).map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href.includes('/profile/') && pathname.startsWith('/profile/'))
              const isNotifications = href === '/notifications'
              const isMessages = href === '/messages'
              const badge = isNotifications ? unreadCount : isMessages ? unreadDmCount : 0
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => onOpenChange(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-base transition-all
                    ${active ? 'font-bold text-primary bg-primary/10' : 'font-medium hover:bg-accent'}`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'stroke-[2.5px]' : ''}`} />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  {label}
                  {badge > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-0.5">
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <button
              onClick={() => { onOpenChange(false); handleLogout() }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-full text-base font-medium transition-colors hover:bg-accent w-full text-left text-muted-foreground"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Log out
            </button>
          </div>
        </SheetContent>
      </Sheet>
  )
}
