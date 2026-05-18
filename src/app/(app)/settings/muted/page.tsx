import { createClient } from '@/lib/supabase/server'
import { getMutedUsers, getMutedWords } from '@/lib/queries/settings'
import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import MutedList from '@/components/settings/MutedList'
import MutedWords from '@/components/settings/MutedWords'

export default async function MutedSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [mutedList, mutedWords] = await Promise.all([
    getMutedUsers(user!.id),
    getMutedWords(user!.id),
  ])

  return (
    <SettingsPage title="Muted" description="Muted accounts and words are hidden from your feeds.">
      <SettingsRow>
        <p className="font-medium text-sm">Muted accounts</p>
        <p className="text-muted-foreground text-sm">They won&apos;t know you&apos;ve muted them.</p>
        <MutedList initialList={mutedList} />
      </SettingsRow>
      <SettingsRow>
        <p className="font-medium text-sm">Muted words</p>
        <p className="text-muted-foreground text-sm">Tweets containing these words are hidden from your feeds.</p>
        <MutedWords initialWords={mutedWords} />
      </SettingsRow>
    </SettingsPage>
  )
}
