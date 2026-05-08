'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Palette, Lock, Bell, Ban, VolumeX, Shield, Download } from 'lucide-react'

const items = [
  { href: '/settings/account', label: 'Account', icon: User },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
  { href: '/settings/privacy', label: 'Privacy', icon: Lock },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/blocked', label: 'Blocked accounts', icon: Ban },
  { href: '/settings/muted', label: 'Muted', icon: VolumeX },
  { href: '/settings/security', label: 'Security', icon: Shield },
  { href: '/settings/data', label: 'Your data', icon: Download },
]

export default function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-full">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 border-b ${active ? 'font-bold bg-muted/30 border-l-2 border-l-primary' : 'font-medium'}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
