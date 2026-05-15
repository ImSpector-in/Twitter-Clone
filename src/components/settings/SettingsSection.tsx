import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function SettingsPage({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="border-b px-6 py-4 flex items-center gap-3">
        <Link href="/home" className="p-1 rounded-full hover:bg-muted transition-colors sm:hidden shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {description && <p className="text-muted-foreground text-sm mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="divide-y">
        {children}
      </div>
    </div>
  )
}

export function SettingsRow({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-5 space-y-4">{children}</div>
}

export function SettingsDanger({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-5 space-y-4 bg-destructive/5 border-t border-destructive/20">
      <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Danger zone</p>
      {children}
    </div>
  )
}
