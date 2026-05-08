import { createClient } from '@/lib/supabase/server'
import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import MutedList from '@/components/settings/MutedList'
import MutedWords from '@/components/settings/MutedWords'

export default async function MutedSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [mutedRows, mutedWords] = await Promise.all([
    supabase.from('mutes').select('profiles!mutes_muted_id_fkey (id, username, display_name, avatar_url)').eq('muter_id', user!.id),
    supabase.from('muted_words').select('id, word').eq('user_id', user!.id).order('created_at'),
  ])
  const mutedList = mutedRows.data?.map((r: any) => r.profiles).filter(Boolean) ?? []

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
        <MutedWords initialWords={mutedWords.data ?? []} />
      </SettingsRow>
    </SettingsPage>
  )
}
