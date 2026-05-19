import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import TwoFactorSetupWizard from '@/components/auth/TwoFactorSetupWizard'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

export const dynamic = 'force-dynamic'

export default async function SetupTwoFactorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: mfaData } = await supabase.auth.mfa.listFactors()

  // If the user already has a verified TOTP factor, nothing to set up
  const hasVerified = mfaData?.totp?.some((f) => f.status === 'verified')
  if (hasVerified) redirect('/home')

  // Clean up any leftover unverified factors from abandoned sessions
  const unverified = mfaData?.totp?.filter((f) => f.status === 'unverified') ?? []
  await Promise.all(unverified.map((f) => supabase.auth.mfa.unenroll({ factorId: f.id })))

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
          <TwoFactorSetupWizard />
        </div>
      </div>
    </div>
  )
}
