import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { AuthSplitLayout } from '../auth/AuthSplitLayout'
import styles from '../SignInPage/SignInPage.module.css'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 5.1A9.7 9.7 0 0 1 12 5c5.5 0 9 7 9 7a13.4 13.4 0 0 1-2.1 2.85M6.6 6.6C4.4 8.1 3 12 3 12a13.5 13.5 0 0 0 3.3 4.4" />
    </svg>
  )
}

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const clearMessages = () => {
    setError('')
    setInfo('')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      setInfo('')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.')
      setInfo('')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setInfo('')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setInfo('')
      return
    }

    setLoading(true)
    setError('')
    setInfo('')
    const { error: authError, needsConfirmation } = await signUp(email.trim(), password)
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    if (needsConfirmation) {
      setInfo('Account created. Check your email to confirm, then sign in.')
      return
    }

    navigate('/workspace', { replace: true })
  }

  return (
    <AuthSplitLayout>
      <form onSubmit={onSubmit}>
        <div className={styles.title}>Create your account</div>
        <p className={styles.subtitle}>Start analyzing images in your research workspace.</p>

        {error && (
          <div role="alert" className={styles.error}>
            {error}
          </div>
        )}
        {info && (
          <div role="status" className={styles.info}>
            {info}
          </div>
        )}

        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            clearMessages()
          }}
          placeholder="you@institution.edu"
          required
        />

        <label htmlFor="signup-pw">Password</label>
        <div className={styles.pwWrap}>
          <input
            id="signup-pw"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearMessages()
            }}
            placeholder="Create a strong password"
            required
          />
          <button
            type="button"
            className={styles.pwToggle}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            aria-pressed={showPw}
            onClick={() => setShowPw((v) => !v)}
          >
            <EyeIcon open={showPw} />
          </button>
        </div>

        <label htmlFor="signup-confirm-pw">Confirm password</label>
        <div className={styles.pwWrap}>
          <input
            id="signup-confirm-pw"
            type={showConfirmPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              clearMessages()
            }}
            placeholder="Re-enter your password"
            required
          />
          <button
            type="button"
            className={styles.pwToggle}
            aria-label={showConfirmPw ? 'Hide confirm password' : 'Show confirm password'}
            aria-pressed={showConfirmPw}
            onClick={() => setShowConfirmPw((v) => !v)}
          >
            <EyeIcon open={showConfirmPw} />
          </button>
        </div>

        <div className={styles.row}>
          <span />
          <Link to="/signin">Sign in</Link>
        </div>

        <Button type="submit" fullWidth disabled={loading} className={styles.submit}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <div className={styles.back}>
          <Link to="/">&larr; Return to home</Link>
        </div>
      </form>
    </AuthSplitLayout>
  )
}
