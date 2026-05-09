import SignupForm from '@/components/auth/SignupForm'
import QuotoraLogo from '@/components/ui/QuotoraLogo'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-orange-600 to-orange-500 items-center justify-center p-12">
        <div className="text-white space-y-6 max-w-xs">
          <QuotoraLogo size={72} />
          <div>
            <h2 className="text-4xl font-bold leading-tight">Join Quotora</h2>
            <p className="text-white/80 text-lg mt-2">Share thoughts. Spark connections.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <div className="lg:hidden mb-4"><QuotoraLogo size={40} /></div>
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-muted-foreground">Join the conversation on Quotora</p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
