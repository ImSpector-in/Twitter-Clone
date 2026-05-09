import LoginForm from '@/components/auth/LoginForm'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import QuotoraLogo from '@/components/ui/QuotoraLogo'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center relative overflow-hidden py-10">
      {/* Background blobs — purely decorative, don't interfere with content */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-orange-100/80 blur-sm" />
      <div className="absolute top-10 -left-10 w-48 h-48 rounded-full bg-orange-200/40" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-400/30 blur-md" />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-red-400/20" />

      {/* Content — always above blobs */}
      <div className="relative z-10 w-full max-w-sm mx-6 space-y-5">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <QuotoraLogo size={90} />
          </div>
          <h1 className="text-4xl font-extrabold text-orange-600 tracking-tight">Quotora</h1>
          <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase">
            Share thoughts. Spark connections.
          </p>
        </div>

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
  )
}
