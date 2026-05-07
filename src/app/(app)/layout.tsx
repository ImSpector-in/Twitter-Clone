import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/nav/Sidebar'

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
        {/* Sidebar */}
        <aside className="w-16 xl:w-64 shrink-0 border-r flex flex-col sticky top-0 h-screen">
          <Sidebar username={username} />
        </aside>
        {/* Main content */}
        <main className="flex-1 min-w-0 border-r max-w-2xl">
          {children}
        </main>
        {/* Right column — empty for now */}
        <div className="hidden lg:block w-80 shrink-0 p-4">
          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            More features coming soon.
          </div>
        </div>
      </div>
    </div>
  )
}
