import SignupForm from '@/components/auth/SignupForm'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import QuotoraLogo from '@/components/ui/QuotoraLogo'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#fdf0ea] flex items-center justify-center relative overflow-hidden py-12 px-4">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#f9d5c0]/60" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-red-500/70 to-orange-400/60" />
      <div className="absolute -right-32 top-1/4 w-72 h-72 rounded-full bg-[#f9d5c0]/40" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <QuotoraLogo size={64} />
            <span className="text-5xl font-extrabold text-orange-600 tracking-tight">Quotora</span>
          </div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-orange-500 uppercase mt-1">
            Share thoughts. Spark connections.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
          <SignupForm />
          <SocialAuthButtons />
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
