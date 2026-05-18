import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/queries/profile'
import CompactComposer from './CompactComposer'

export default async function HomeComposer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getCurrentUserProfile(user.id)
  const displayName = profile?.display_name || profile?.username || 'User'

  return <CompactComposer avatarUrl={profile?.avatar_url ?? null} displayName={displayName} />
}
