import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DiscoverTabs from '@/components/discover/DiscoverTabs'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Link href="/home" className="p-1 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-xl font-bold">Search</h2>
      </div>
      <DiscoverTabs currentUserId={user!.id} />
    </div>
  )
}
