import UserSearch from '@/components/discover/UserSearch'
import { createClient } from '@/lib/supabase/server'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Discover</h2>
        <p className="text-muted-foreground text-sm">Search for people to follow</p>
      </div>
      <UserSearch currentUserId={user!.id} />
    </div>
  )
}
