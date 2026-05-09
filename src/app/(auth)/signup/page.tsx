import SignupForm from '@/components/auth/SignupForm'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import QuotoraLogo from '@/components/ui/QuotoraLogo'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#fdf5f0] flex items-center justify-center relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-orange-100/70" />
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-orange-200/40" />
      <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-[60%] translate-y-8" />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4 space-y-5 py-8">
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

        <p className="text-center text-sm text-gray-500 pb-4">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
