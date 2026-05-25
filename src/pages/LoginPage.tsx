import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    const result = await authService.signInWithGoogle()
    if (!result.success) {
      toast.error(result.error)
      setSigningIn(false)
    }
    // Auth context will redirect via useEffect above
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lifted">
          <span className="text-4xl">🛒</span>
        </div>
        <h1 className="text-2xl font-bold text-ink">Grocery Billing</h1>
        <p className="text-ink-muted text-sm mt-1">Smart billing for your store</p>
      </div>

      {/* Sign in card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-surface-border p-6">
        <h2 className="font-semibold text-ink text-lg mb-1">Welcome back</h2>
        <p className="text-ink-muted text-sm mb-6">Sign in to continue to your store</p>

        <Button
          onClick={handleGoogleSignIn}
          loading={signingIn}
          size="lg"
          variant="secondary"
          className="w-full"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
          Continue with Google
        </Button>

        <p className="text-xs text-ink-faint text-center mt-4">
          First sign-up gets admin access. Others are assigned roles by the admin.
        </p>
      </div>
    </div>
  )
}
