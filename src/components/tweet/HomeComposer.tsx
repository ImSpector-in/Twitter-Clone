import { createClient } from '@/lib/supabase/server'
import CompactComposer from './CompactComposer'

export default async function HomeComposer() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, username')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || profile?.username || 'User'

  return <CompactComposer avatarUrl={profile?.avatar_url ?? null} displayName={displayName} />
}
