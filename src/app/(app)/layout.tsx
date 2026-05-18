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

  // Run profile fetch and unread counts in parallel — all only need user.id
  const [profileResult, unreadCount, unreadDmCount] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single(),
    getUnreadCount(user.id),
    getUnreadDmCount(user.id),
  ])

  const profile = profileResult.data
  const username = profile?.username ?? 'unknown'
  const displayName = profile?.display_name || profile?.username || 'User'
  const avatarUrl = profile?.avatar_url ?? null

  return (
    <div className="min-h-dvh bg-background">
      <MobileNavController
        username={username}
        displayName={displayName}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
        unreadDmCount={unreadDmCount}
      />

      <div className="max-w-7xl mx-auto px-4 flex gap-6 pt-4 pb-20 md:pb-4">
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-20">
            <Sidebar username={username} unreadCount={unreadCount} unreadDmCount={unreadDmCount} />
          </div>
        </aside>

        <main className="flex-1 min-w-0 max-w-2xl">
          {children}
        </main>

        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 space-y-4">
            <Suspense fallback={<div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading...</div>}>
              <TrendingSidebar />
            </Suspense>
          </div>
        </aside>
      </div>

      <BottomNav username={username} />
      <FloatingPostButton />
    </div>
  )
}
