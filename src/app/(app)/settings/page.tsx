import { createClient } from '@/lib/supabase/server'
import PrivacyToggle from '@/components/settings/PrivacyToggle'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_private')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Settings</h2>
      </div>
      <div className="divide-y">
        <div className="px-4 py-6 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Privacy</h3>
          <PrivacyToggle initialIsPrivate={profile?.is_private ?? false} />
        </div>
      </div>
    </div>
  )
}
