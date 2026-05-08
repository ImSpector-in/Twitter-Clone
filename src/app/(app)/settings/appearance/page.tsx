import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import DarkModeToggle from '@/components/settings/DarkModeToggle'

export default function AppearanceSettingsPage() {
  return (
    <SettingsPage title="Appearance" description="Customize how the app looks.">
      <SettingsRow>
        <DarkModeToggle />
      </SettingsRow>
    </SettingsPage>
  )
}
