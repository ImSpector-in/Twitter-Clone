'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { settingsNavItems } from '@/components/settings/settingsNavItems'

export default function SettingsIndexPage() {
  const router = useRouter()

  useEffect(() => {
    if (window.matchMedia('(min-width: 640px)').matches) {
      router.replace('/settings/account')
    }
  }, [router])

  return (
    <div className="sm:hidden">
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Settings</h2>
      </div>
      <nav aria-label="Settings navigation">
        <ul role="list">
          {settingsNavItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 px-4 py-4 text-sm border-b hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="flex-1 font-medium">{label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
