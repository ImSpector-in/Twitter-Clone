import { createClient } from '@/lib/supabase/server'

export async function getNotifications(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      read,
      created_at,
      tweet_id,
      actor:profiles!notifications_actor_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient()

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  return count ?? 0
}
