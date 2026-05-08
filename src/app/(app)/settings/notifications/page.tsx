import { createClient } from '@/lib/supabase/server'
import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import NotificationToggles from '@/components/settings/NotificationToggles'

export default async function NotificationsSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('notify_likes, notify_replies, notify_follows')
    .eq('id', user!.id)
    .single()

  return (
    <SettingsPage title="Notifications" description="Choose which notifications you receive.">
      <SettingsRow>
        <NotificationToggles
          initialLikes={profile?.notify_likes ?? true}
          initialReplies={profile?.notify_replies ?? true}
          initialFollows={profile?.notify_follows ?? true}
        />
      </SettingsRow>
    </SettingsPage>
  )
}
