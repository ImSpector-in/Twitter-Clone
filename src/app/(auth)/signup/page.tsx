import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left teal gradient panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-cyan-400 to-primary items-center justify-center p-12">
        <div className="text-white space-y-4 max-w-xs">
          <div className="text-7xl font-black">𝕏</div>
          <h2 className="text-3xl font-bold leading-tight">Start today.</h2>
          <p className="text-white/80 text-lg">Create an account and join the conversation.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <div className="text-4xl font-black bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent lg:hidden">𝕏</div>
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-muted-foreground">Join the conversation today</p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
