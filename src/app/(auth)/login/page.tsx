import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left teal gradient panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-cyan-400 to-teal-600 items-center justify-center p-12">
        <div className="text-white space-y-4 max-w-xs">
          <div className="text-7xl font-black">𝕏</div>
          <h2 className="text-3xl font-bold leading-tight">Join the conversation.</h2>
          <p className="text-white/80 text-lg">Share what&apos;s happening. Connect with the world.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <div className="text-4xl font-black bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent lg:hidden">𝕏</div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
