import { SettingsPage, SettingsRow } from '@/components/settings/SettingsSection'
import DataExport from '@/components/settings/DataExport'

export default function DataSettingsPage() {
  return (
    <SettingsPage title="Your data" description="Download or manage your data.">
      <SettingsRow>
        <DataExport />
      </SettingsRow>
    </SettingsPage>
  )
}
