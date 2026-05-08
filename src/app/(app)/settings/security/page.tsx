import { createClient } from '@/lib/supabase/server'
import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import TwoFactorSetup from '@/components/settings/TwoFactorSetup'

export default async function SecuritySettingsPage() {
  const supabase = await createClient()
  const { data: mfaData } = await supabase.auth.mfa.listFactors()
  const twoFactorEnabled = (mfaData?.totp?.length ?? 0) > 0

  return (
    <SettingsPage title="Security" description="Manage your account security settings.">
      <SettingsRow>
        <TwoFactorSetup isEnabled={twoFactorEnabled} />
      </SettingsRow>
    </SettingsPage>
  )
}
