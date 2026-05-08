import { createClient } from '@/lib/supabase/server'
import { SettingsPage, SettingsRow, SettingsDanger } from '@/components/settings/SettingsSection'
import ChangeEmailForm from '@/components/settings/ChangeEmailForm'
import ChangePasswordForm from '@/components/settings/ChangePasswordForm'
import LogoutEverywhereButton from '@/components/settings/LogoutEverywhereButton'
import DeleteAccountButton from '@/components/settings/DeleteAccountButton'

export default async function AccountSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <SettingsPage title="Account" description="Manage your account information.">
      <SettingsRow>
        <ChangeEmailForm currentEmail={user?.email ?? ''} />
      </SettingsRow>
      <SettingsRow>
        <ChangePasswordForm />
      </SettingsRow>
      <SettingsRow>
        <LogoutEverywhereButton />
      </SettingsRow>
      <SettingsDanger>
        <DeleteAccountButton />
      </SettingsDanger>
    </SettingsPage>
  )
}
