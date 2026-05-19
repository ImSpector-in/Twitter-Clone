import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TwoFactorSetupWizard from '@/components/auth/TwoFactorSetupWizard'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

export const dynamic = 'force-dynamic'

export default async function SetupTwoFactorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: mfaData } = await supabase.auth.mfa.listFactors()

  // mfaData.totp contains only verified factors — if any exist, setup is already done
  if ((mfaData?.totp?.length ?? 0) > 0) redirect('/home')

  // Determine where to send the user after setup/skip.
  // Fetch profile server-side so the wizard doesn't need a client-side DB call.
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
  const postSetupDest = profile?.username?.startsWith('user_') ? '/profile/edit?welcome=1' : '/home'

  // Note: unverified factor cleanup is intentionally omitted here.
  // Cleaning up in a server component re-runs on every router.refresh(), which
  // races with the client-side enrollment flow. The hook handles cleanup in
  // handleEnroll() before creating a new factor.

  return (
    <div className="min-h-screen bg-[#fdf0ea] flex items-center justify-center relative overflow-hidden py-12 px-4">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#f9d5c0]/60" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-red-500/70 to-orange-400/60" />
      <div className="absolute -right-32 top-1/4 w-72 h-72 rounded-full bg-[#f9d5c0]/40" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <QuotoraLogo size={48} />
            <span className="text-4xl font-extrabold text-orange-600 tracking-tight" style={{ fontFamily: 'var(--font-nunito)' }}>Quotora</span>
          </div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-orange-500 uppercase mt-1">
            Secure your new account
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <TwoFactorSetupWizard postSetupDest={postSetupDest} />
        </div>
      </div>
    </div>
  )
}
