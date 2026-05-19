'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { settingsNavItems } from './settingsNavItems'

export default function SettingsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-full">
      {settingsNavItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 border-b ${active ? 'font-bold bg-muted/30 border-l-2 border-l-primary' : 'font-medium'}`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
