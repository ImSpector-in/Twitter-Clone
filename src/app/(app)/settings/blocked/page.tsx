import { createClient } from '@/lib/supabase/server'
import { getBlockedUsers } from '@/lib/queries/settings'
import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import BlockedList from '@/components/settings/BlockedList'

export default async function BlockedSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const blockedList = await getBlockedUsers(user!.id)

  return (
    <SettingsPage title="Blocked accounts" description="Blocked accounts cannot see your tweets or interact with you.">
      <SettingsRow>
        <BlockedList initialList={blockedList} />
      </SettingsRow>
    </SettingsPage>
  )
}
