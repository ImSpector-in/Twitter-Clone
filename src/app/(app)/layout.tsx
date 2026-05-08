import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUnreadCount } from '@/lib/queries/notifications'
import Sidebar from '@/components/nav/Sidebar'
import BottomNav from '@/components/nav/BottomNav'
import MobileMenu from '@/components/nav/MobileMenu'
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
  const unreadCount = await getUnreadCount(user.id)

  return (
    <div className="min-h-screen flex justify-center">
      <div className="flex w-full max-w-5xl">
        {/* Sidebar — hidden on mobile */}
        <aside className="hidden md:flex w-16 xl:w-64 shrink-0 border-r flex-col sticky top-0 h-screen">
          <Sidebar username={username} userId={user.id} unreadCount={unreadCount} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 border-r max-w-2xl pb-16 md:pb-0">
          {children}
        </main>

        {/* Right column */}
        <div className="hidden lg:block w-80 shrink-0 p-4 space-y-4">
          <Suspense fallback={<div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">Loading news...</div>}>
            <TrendingSidebar />
          </Suspense>
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav username={username} />
      <FloatingPostButton />

      {/* Mobile slide-in menu */}
      <MobileMenu
        username={username}
        displayName={displayName}
        avatarUrl={avatarUrl}
        unreadCount={unreadCount}
      />
    </div>
  )
}
