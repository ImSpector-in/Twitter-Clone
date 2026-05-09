import SignupForm from '@/components/auth/SignupForm'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import QuotoraLogo from '@/components/ui/QuotoraLogo'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center relative overflow-hidden py-10">
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-orange-100/80 blur-sm" />
      <div className="absolute top-10 -left-10 w-48 h-48 rounded-full bg-orange-200/40" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-400/30 blur-md" />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-red-400/20" />

      <div className="relative z-10 w-full max-w-sm mx-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <QuotoraLogo size={80} />
          </div>
          <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">Join Quotora</h1>
          <p className="text-xs font-bold tracking-[0.2em] text-orange-500 uppercase">
            Share thoughts. Spark connections.
          </p>
        </div>

        <SignupForm />
        <SocialAuthButtons />

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
