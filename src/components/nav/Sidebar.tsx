'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  username: string
}

const navItems = (username: string) => [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: `/profile/${username}`, label: 'Profile', icon: User },
]

export default function Sidebar({ username }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="flex flex-col gap-1 p-3">
      <Link href="/home" className="text-2xl font-bold px-3 py-2 mb-2">𝕏</Link>
      {navItems(username).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-base font-medium transition-colors hover:bg-muted w-fit ${active ? 'font-bold' : ''}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden xl:inline">{label}</span>
          </Link>
        )
      })}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-full text-base font-medium transition-colors hover:bg-muted w-fit text-left mt-auto"
      >
        <LogOut className="h-5 w-5 shrink-0" />
        <span className="hidden xl:inline">Log out</span>
      </button>
    </nav>
  )
}
