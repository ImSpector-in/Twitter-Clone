import LoginForm from '@/components/auth/LoginForm'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 items-center justify-center p-12">
        <div className="text-white space-y-6 max-w-xs">
          <QuotoraLogo size={72} />
          <div>
            <h2 className="text-4xl font-bold leading-tight">Quotora</h2>
            <p className="text-white/80 text-lg mt-2">Share thoughts. Spark connections.</p>
          </div>
        </div>
      </div>
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
