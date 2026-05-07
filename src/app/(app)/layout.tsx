import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/nav/Sidebar'
import BottomNav from '@/components/nav/BottomNav'
import FloatingPostButton from '@/components/tweet/FloatingPostButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? 'unknown'

  return (
    <div className="min-h-screen flex justify-center">
      <div className="flex w-full max-w-5xl">
        {/* Sidebar — hidden on mobile */}
        <aside className="hidden md:flex w-16 xl:w-64 shrink-0 border-r flex-col sticky top-0 h-screen">
          <Sidebar username={username} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 border-r max-w-2xl pb-16 md:pb-0">
          {children}
        </main>

        {/* Right column — hidden on smaller screens */}
        <div className="hidden lg:block w-80 shrink-0 p-4">
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            More features coming soon.
          </div>
        </div>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav username={username} />
      <FloatingPostButton />
    </div>
  )
}
