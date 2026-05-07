import { createClient } from '@/lib/supabase/server'

export async function getAllTweets() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tweets')
    .select(`
      id,
      content,
      created_at,
      user_id,
      profiles!tweets_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}
