import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUnreadCount } from '@/lib/queries/notifications'
import { getUnreadDmCount } from '@/lib/queries/messages'
import MobileNavController from '@/components/nav/MobileNavController'
import Sidebar from '@/components/nav/Sidebar'
import BottomNav from '@/components/nav/BottomNav'
import FloatingPostButton from '@/components/tweet/FloatingPostButton'
import TrendingSidebar from '@/components/trending/TrendingSidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? 'unknown'
  const displayName = profile?.display_name || profile?.username || 'User'
  const avatarUrl = profile?.avatar_url ?? null
  const [unreadCount, unreadDmCount] = await Promise.all([
    getUnreadCount(user.id),
    getUnreadDmCount(user.id),
  ])

  return (
    <div className="min-h-dvh bg-background">
      {/* Top navigation bar + mobile drawer (shared state in controller) */}
      <MobileNavController
        username={username}
        displayName={displayName}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
        unreadDmCount={unreadDmCount}
      />

      {/* Page body */}
      <div className="max-w-7xl mx-auto px-4 flex gap-6 pt-4 pb-20 md:pb-4">

        {/* Left sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-20">
            <Sidebar username={username} unreadCount={unreadCount} unreadDmCount={unreadDmCount} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-2xl">
          {children}
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 space-y-4">
            <Suspense fallback={<div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading...</div>}>
              <TrendingSidebar />
            </Suspense>
          </div>
        </aside>
      </div>

      {/* Mobile nav */}
      <BottomNav username={username} />
      <FloatingPostButton />
    </div>
  )
}
