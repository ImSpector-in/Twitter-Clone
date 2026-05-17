'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import QuotoraLogo from '@/components/ui/QuotoraLogo'
import { NAV_ITEMS } from '@/config/nav'

const MAX_BADGE = 9

type Props = {
  username: string
  displayName: string
  avatarUrl: string | null
  unreadCount: number
  unreadDmCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MobileMenu({ username, displayName, avatarUrl, unreadCount, unreadDmCount, open, onOpenChange }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
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
            <Link
              href={`/profile/${username}`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              aria-label={`View profile for ${displayName}`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-orange-400 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm">{displayName}</p>
                <p className="text-muted-foreground text-xs">@{username}</p>
              </div>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col p-3 gap-0.5">
          {NAV_ITEMS(username).map(({ href, label, icon: Icon }) => {
            const isOwnProfile = href === `/profile/${username}`
            const active = pathname === href || (isOwnProfile && pathname === `/profile/${username}`)
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
                      {badge > MAX_BADGE ? `${MAX_BADGE}+` : badge}
                    </span>
                  )}
                </div>
                {label}
                {badge > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-0.5">
                    {badge > MAX_BADGE ? `${MAX_BADGE}+` : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={() => { onOpenChange(false); handleLogout() }}
            disabled={loggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-full text-base font-medium transition-colors hover:bg-accent w-full text-left text-muted-foreground disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
