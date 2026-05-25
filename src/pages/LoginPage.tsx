import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Send, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui'
import toast from 'react-hot-toast'

type Mode = 'choose' | 'email-password' | 'register' | 'magic-link' | 'magic-sent'

export function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('choose')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate('/dashboard', { replace: true })
  }, [user, loading, navigate])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleGoogle = async () => {
    setBusy(true)
    const result = await authService.signInWithGoogle()
    if (!result.success) { toast.error(result.error); setBusy(false) }
  }

  const handleEmailSignIn = async () => {
    if (!email || !password) return toast.error('Enter your email and password')
    setBusy(true)
    const result = await authService.signInWithEmailPassword(email, password)
    if (!result.success) { toast.error(result.error); setBusy(false) }
  }

  const handleRegister = async () => {
    if (!displayName.trim()) return toast.error('Enter your name')
    if (!email) return toast.error('Enter your email')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setBusy(true)
    const result = await authService.registerWithEmailPassword(email, password, displayName.trim())
    if (!result.success) { toast.error(result.error); setBusy(false) }
  }

  const handleMagicLink = async () => {
    if (!email) return toast.error('Enter your email')
    setBusy(true)
    const result = await authService.sendMagicLink(email)
    setBusy(false)
    if (result.success) {
      setMode('magic-sent')
    } else {
      toast.error(result.error)
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex flex-col items-center justify-center px-6 py-10">

      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lifted">
          <span className="text-4xl">🛒</span>
        </div>
        <h1 className="text-2xl font-bold text-ink">Grocery Billing</h1>
        <p className="text-ink-muted text-sm mt-1">Smart billing for your store</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card border border-surface-border p-6">

        {/* Back button for sub-screens */}
        {mode !== 'choose' && mode !== 'magic-sent' && (
          <button
            onClick={() => setMode('choose')}
            className="flex items-center gap-1 text-sm text-ink-muted mb-4 -ml-1 hover:text-ink"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}

        {/* ── Choose screen ─────────────────────────────────────────── */}
        {mode === 'choose' && (
          <>
            <h2 className="font-semibold text-ink text-lg mb-1">Welcome</h2>
            <p className="text-ink-muted text-sm mb-5">Sign in to continue</p>

            <div className="flex flex-col gap-3">
              {/* Google */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                loading={busy}
                onClick={handleGoogle}
              >
                <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-xs text-ink-faint">or</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>

              {/* Email + Password */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => setMode('email-password')}
              >
                <Lock size={16} />
                Sign in with Password
              </Button>

              {/* Magic Link */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => setMode('magic-link')}
              >
                <Send size={16} />
                Send Magic Link
              </Button>
            </div>

            <p className="text-xs text-ink-faint text-center mt-5">
              New here?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-primary-600 font-medium underline"
              >
                Create an account
              </button>
            </p>
          </>
        )}

        {/* ── Email + Password sign-in ───────────────────────────────── */}
        {mode === 'email-password' && (
          <>
            <h2 className="font-semibold text-ink text-lg mb-4">Sign in</h2>
            <div className="flex flex-col gap-3">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                size="lg"
                className="w-full mt-1"
                loading={busy}
                onClick={handleEmailSignIn}
              >
                Sign in <ArrowRight size={16} />
              </Button>
            </div>
            <p className="text-xs text-ink-faint text-center mt-4">
              No account?{' '}
              <button onClick={() => setMode('register')} className="text-primary-600 font-medium underline">
                Register
              </button>
            </p>
          </>
        )}

        {/* ── Register ──────────────────────────────────────────────── */}
        {mode === 'register' && (
          <>
            <h2 className="font-semibold text-ink text-lg mb-4">Create account</h2>
            <div className="flex flex-col gap-3">
              <Input
                label="Your name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button
                size="lg"
                className="w-full mt-1"
                loading={busy}
                onClick={handleRegister}
              >
                Create account <ArrowRight size={16} />
              </Button>
            </div>
            <p className="text-xs text-ink-faint text-center mt-4">
              Already have an account?{' '}
              <button onClick={() => setMode('email-password')} className="text-primary-600 font-medium underline">
                Sign in
              </button>
            </p>
          </>
        )}

        {/* ── Magic Link ────────────────────────────────────────────── */}
        {mode === 'magic-link' && (
          <>
            <h2 className="font-semibold text-ink text-lg mb-1">Magic Link</h2>
            <p className="text-ink-muted text-sm mb-4">
              We'll send a one-tap sign-in link to your email. No password needed.
            </p>
            <div className="flex flex-col gap-3">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Button
                size="lg"
                className="w-full"
                loading={busy}
                onClick={handleMagicLink}
              >
                <Send size={16} /> Send Magic Link
              </Button>
            </div>
          </>
        )}

        {/* ── Magic Link Sent ───────────────────────────────────────── */}
        {mode === 'magic-sent' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-primary-600" />
            </div>
            <h2 className="font-semibold text-ink text-lg mb-2">Check your inbox</h2>
            <p className="text-ink-muted text-sm mb-1">
              We sent a sign-in link to
            </p>
            <p className="font-medium text-ink text-sm mb-5">{email}</p>
            <p className="text-xs text-ink-faint">
              Tap the link in the email to sign in instantly.
              You can close this tab.
            </p>
            <button
              onClick={() => setMode('magic-link')}
              className="mt-4 text-sm text-primary-600 underline"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-ink-faint text-center mt-4 px-4">
        First account created automatically becomes Admin.
      </p>
    </div>
  )
}
