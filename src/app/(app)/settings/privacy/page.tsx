import { createClient } from '@/lib/supabase/server'
import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import PrivacyToggle from '@/components/settings/PrivacyToggle'
import ReplyScopeSelector from '@/components/settings/ReplyScopeSelector'

export default async function PrivacySettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_private, reply_scope')
    .eq('id', user!.id)
    .single()

  return (
    <SettingsPage title="Privacy" description="Control who can see and interact with your content.">
      <SettingsRow>
        <PrivacyToggle initialIsPrivate={profile?.is_private ?? false} />
      </SettingsRow>
      <SettingsRow>
        <p className="font-medium text-sm">Who can reply to your tweets</p>
        <p className="text-muted-foreground text-sm">This applies to new tweets you post.</p>
        <ReplyScopeSelector initialScope={profile?.reply_scope ?? 'everyone'} />
      </SettingsRow>
    </SettingsPage>
  )
}
