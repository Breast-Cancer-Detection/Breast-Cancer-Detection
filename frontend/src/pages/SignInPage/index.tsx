import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { AuthSplitLayout } from '../auth/AuthSplitLayout'
import styles from './SignInPage.module.css'

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from =
    (location.state as { from?: string } | null)?.from &&
    (location.state as { from: string }).from !== '/signin'
      ? (location.state as { from: string }).from
      : '/workspace'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')
    const { error: authError } = await signIn(email.trim(), password)
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <AuthSplitLayout>
      <form onSubmit={onSubmit}>
        <div className={styles.title}>Welcome back</div>
        <p className={styles.subtitle}>Sign in to continue to your analysis workspace.</p>

        {error && (
          <div role="alert" className={styles.error}>
            {error}
          </div>
        )}

        <label htmlFor="signin-email">Email</label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          placeholder="you@institution.edu"
          required
        />

        <label htmlFor="signin-pw">Password</label>
        <div className={styles.pwWrap}>
          <input
            id="signin-pw"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="Enter your password"
            required
          />
            <button
              type="button"
              className={styles.pwToggle}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              aria-pressed={showPw}
              onClick={() => setShowPw((v) => !v)}
            >
            {showPw ? (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.1A9.7 9.7 0 0 1 12 5c5.5 0 9 7 9 7a13.4 13.4 0 0 1-2.1 2.85M6.6 6.6C4.4 8.1 3 12 3 12a13.5 13.5 0 0 0 3.3 4.4" />
              </svg>
            )}
          </button>
        </div>

        <div className={styles.row}>
          <Link to="/forgot-password">Forgot password</Link>
          <Link to="/signup">Create account</Link>
        </div>

        <Button type="submit" fullWidth disabled={loading} className={styles.submit}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>

        <div className={styles.back}>
          <Link to="/">&larr; Return to home</Link>
        </div>
      </form>
    </AuthSplitLayout>
  )
}
