import type { SupabaseClient } from '@supabase/supabase-js'

export async function isBlockedEitherDirection(
  supabase: SupabaseClient,
  userA: string,
  userB: string
): Promise<boolean> {
  const { data } = await supabase
    .from('blocks')
    .select('blocker_id')
    .or(`and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`)
    .limit(1)
    .maybeSingle()
  return !!data
}
