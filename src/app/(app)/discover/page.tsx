import { createClient } from '@/lib/supabase/server'
import DiscoverTabs from '@/components/discover/DiscoverTabs'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Search</h2>
      </div>
      <DiscoverTabs currentUserId={user!.id} />
    </div>
  )
}
