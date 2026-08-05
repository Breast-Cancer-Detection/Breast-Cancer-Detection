import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button'
import { AuthSplitLayout } from '../auth/AuthSplitLayout'
import styles from '../SignInPage/SignInPage.module.css'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address.')
      setInfo('')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.')
      setInfo('')
      return
    }

    setLoading(true)
    setError('')
    setInfo('')
    const { error: authError } = await resetPassword(email.trim())
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    setInfo('If an account exists for that email, a reset link has been sent.')
  }

  return (
    <AuthSplitLayout>
      <form onSubmit={onSubmit}>
        <div className={styles.title}>Forgot password</div>
        <p className={styles.subtitle}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

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

        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
            setInfo('')
          }}
          placeholder="you@institution.edu"
          required
        />

        <Button type="submit" fullWidth disabled={loading} className={styles.submit}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>

        <div className={styles.back}>
          <Link to="/signin">&larr; Back to sign in</Link>
        </div>
      </form>
    </AuthSplitLayout>
  )
}
