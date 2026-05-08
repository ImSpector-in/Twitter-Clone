import { createClient } from '@/lib/supabase/server'
import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import BlockedList from '@/components/settings/BlockedList'

export default async function BlockedSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rows } = await supabase
    .from('blocks')
    .select('profiles!blocks_blocked_id_fkey (id, username, display_name, avatar_url)')
    .eq('blocker_id', user!.id)
  const blockedList = rows?.map((r: any) => r.profiles).filter(Boolean) ?? []

  return (
    <SettingsPage title="Blocked accounts" description="Blocked accounts cannot see your tweets or interact with you.">
      <SettingsRow>
        <BlockedList initialList={blockedList} />
      </SettingsRow>
    </SettingsPage>
  )
}
