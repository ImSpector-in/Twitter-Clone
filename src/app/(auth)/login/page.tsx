import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold">𝕏</h1>
          <h2 className="text-xl font-semibold">Sign in to your account</h2>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
