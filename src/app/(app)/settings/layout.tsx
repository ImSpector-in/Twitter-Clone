import type { Metadata } from 'next'
import SettingsSidebar from '@/components/settings/SettingsSidebar'

export const metadata: Metadata = { title: 'Settings · Quotora' }

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Settings sidebar */}
      <aside className="w-64 border-r shrink-0 hidden sm:block">
        <div className="border-b px-4 py-3">
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
        <SettingsSidebar />
      </aside>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
