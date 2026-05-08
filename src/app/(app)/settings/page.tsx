import { createClient } from '@/lib/supabase/server'
import ChangePasswordForm from '@/components/settings/ChangePasswordForm'
import ChangeEmailForm from '@/components/settings/ChangeEmailForm'
import DeleteAccountButton from '@/components/settings/DeleteAccountButton'
import DarkModeToggle from '@/components/settings/DarkModeToggle'
import PrivacyToggle from '@/components/settings/PrivacyToggle'
import ReplyScopeSelector from '@/components/settings/ReplyScopeSelector'
import NotificationToggles from '@/components/settings/NotificationToggles'
import BlockedList from '@/components/settings/BlockedList'
import MutedList from '@/components/settings/MutedList'
import MutedWords from '@/components/settings/MutedWords'
import TwoFactorSetup from '@/components/settings/TwoFactorSetup'
import DataExport from '@/components/settings/DataExport'
import LogoutEverywhereButton from '@/components/settings/LogoutEverywhereButton'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b px-4 py-6 space-y-4">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_private, notify_likes, notify_replies, notify_follows, reply_scope')
    .eq('id', user!.id)
    .single()

  // Blocked users
  const { data: blockedRows } = await supabase
    .from('blocks')
    .select('profiles!blocks_blocked_id_fkey (id, username, display_name, avatar_url)')
    .eq('blocker_id', user!.id)
  const blockedList = blockedRows?.map((r: any) => r.profiles).filter(Boolean) ?? []

  // Muted users
  const { data: mutedRows } = await supabase
    .from('mutes')
    .select('profiles!mutes_muted_id_fkey (id, username, display_name, avatar_url)')
    .eq('muter_id', user!.id)
  const mutedList = mutedRows?.map((r: any) => r.profiles).filter(Boolean) ?? []

  // Muted words
  const { data: mutedWords } = await supabase
    .from('muted_words')
    .select('id, word')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  // 2FA status
  const { data: mfaData } = await supabase.auth.mfa.listFactors()
  const twoFactorEnabled = (mfaData?.totp?.length ?? 0) > 0

  const email = user!.email ?? ''

  return (
    <div>
      <div className="border-b px-4 py-3">
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <Section title="Account">
        <ChangeEmailForm currentEmail={email} />
        <ChangePasswordForm />
        <LogoutEverywhereButton />
        <DeleteAccountButton />
      </Section>

      <Section title="Appearance">
        <DarkModeToggle />
      </Section>

      <Section title="Privacy">
        <PrivacyToggle initialIsPrivate={profile?.is_private ?? false} />
        <div>
          <p className="font-medium text-sm mb-2">Who can reply to your tweets</p>
          <ReplyScopeSelector initialScope={profile?.reply_scope ?? 'everyone'} />
        </div>
      </Section>

      <Section title="Notifications">
        <NotificationToggles
          initialLikes={profile?.notify_likes ?? true}
          initialReplies={profile?.notify_replies ?? true}
          initialFollows={profile?.notify_follows ?? true}
        />
      </Section>

      <Section title="Blocked accounts">
        <BlockedList initialList={blockedList} />
      </Section>

      <Section title="Muted accounts">
        <MutedList initialList={mutedList} />
      </Section>

      <Section title="Muted words">
        <MutedWords initialWords={mutedWords ?? []} />
      </Section>

      <Section title="Security">
        <TwoFactorSetup isEnabled={twoFactorEnabled} />
      </Section>

      <Section title="Data">
        <DataExport />
      </Section>
    </div>
  )
}
