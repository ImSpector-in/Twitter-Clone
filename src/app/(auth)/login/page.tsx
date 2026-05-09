import LoginForm from '@/components/auth/LoginForm'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import QuotoraLogo from '@/components/ui/QuotoraLogo'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center relative overflow-hidden">
      {/* Top-left wave decoration */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-orange-100/70" />
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-orange-200/40" />

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-[60%] translate-y-8" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 space-y-6">
        {/* Logo + name */}
        <div className="text-center space-y-2 pt-4">
          <div className="flex justify-center">
            <QuotoraLogo size={90} />
          </div>
          <h1 className="text-4xl font-extrabold text-orange-600 tracking-tight">Quotora</h1>
          <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase">
            Share thoughts. Spark connections.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <LoginForm />
        </div>

        {/* Social auth */}
        <SocialAuthButtons />

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 pb-8">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
