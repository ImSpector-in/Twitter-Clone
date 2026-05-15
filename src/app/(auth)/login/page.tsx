import LoginForm from '@/components/auth/LoginForm'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import QuotoraLogo from '@/components/ui/QuotoraLogo'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fdf0ea] flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Top-left blob — large, light peach */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#f9d5c0]/60" />

      {/* Bottom-left blob — more saturated orange/red */}
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-red-500/70 to-orange-400/60" />

      {/* Right blob — subtle */}
      <div className="absolute -right-32 top-1/4 w-72 h-72 rounded-full bg-[#f9d5c0]/40" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md space-y-6">

        {/* Logo + name side by side */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <QuotoraLogo size={64} />
            <span className="text-5xl font-extrabold text-orange-600 tracking-tight" style={{ fontFamily: 'var(--font-nunito)' }}>Quotora</span>
          </div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-orange-500 uppercase mt-1">
            Share thoughts. Spark connections.
          </p>
        </div>

        {/* White card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
          <LoginForm />
          <SocialAuthButtons />
          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
