import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
        <h1 className="text-xl font-bold">𝕏</h1>
        <LogoutButton />
      </header>
      <main className="max-w-2xl mx-auto">
        {children}
      </main>
    </div>
  )
}
