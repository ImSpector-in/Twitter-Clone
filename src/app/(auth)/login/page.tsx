import LoginForm from '@/components/auth/LoginForm'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — white with orange logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12 border-r border-gray-100">
        <div className="space-y-6 max-w-xs">
          <QuotoraLogo size={80} />
          <div>
            <h2 className="text-4xl font-bold leading-tight text-gray-900">Quotora</h2>
            <p className="text-gray-500 text-lg mt-2">Share thoughts. Spark connections.</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <div className="lg:hidden mb-4"><QuotoraLogo size={40} /></div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your Quotora account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
