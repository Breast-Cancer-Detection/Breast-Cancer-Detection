import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMediaFlags } from '../../hooks/useMediaQuery'
import { Logo } from '../../components/layout/Logo'
import { Button } from '../../components/ui/Button'
import styles from './SignInPage.module.css'

export function SignInPage() {
  const navigate = useNavigate()
  const { isDesktop } = useMediaFlags()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = (e: FormEvent) => {
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
    setTimeout(() => {
      setLoading(false)
      navigate('/workspace')
    }, 900)
  }

  return (
    <div className={styles.root}>
      {isDesktop ? (
        <div className={styles.panel}>
          <svg viewBox="0 0 500 500" className={styles.panelRibbon} aria-hidden="true">
            <path
              d="M-20 380 C 100 300, 200 420, 300 340 C 400 260, 420 380, 520 320"
              stroke="#F5A4BF"
              strokeWidth="40"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <img
            src="/assets/sample-original.png"
            alt=""
            aria-hidden="true"
            className={styles.panelBg}
          />
          <Logo variant="light" />
          <div className={styles.panelCopy}>
            <div className={styles.panelHeadline}>
              Understand the prediction. Explore the reasoning.
            </div>
            <div className={styles.panelThumbs}>
              <img src="/assets/sample-original.png" alt="" />
              <img src="/assets/sample-gradcam.png" alt="" />
            </div>
          </div>
          <div />
        </div>
      ) : (
        <div className={styles.mobileBar}>
          <Logo size="md" variant="light" />
        </div>
      )}

      <div className={styles.formWrap}>
        <main id="main-content" className={styles.form}>
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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            placeholder="you@institution.edu"
          />

          <label htmlFor="signin-pw">Password</label>
          <div className={styles.pwWrap}>
            <input
              id="signin-pw"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className={styles.pwToggle}
              aria-label="Show or hide password"
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
            <label className={styles.remember}>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot password</a>
          </div>

          <Button type="submit" fullWidth disabled={loading} className={styles.submit}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>

          <div className={styles.demo}>
            <button type="button" onClick={() => navigate('/workspace')}>
              Explore the demonstration without signing in
            </button>
          </div>

          <div className={styles.back}>
            <Link to="/">&larr; Return to home</Link>
          </div>
        </form>
        </main>
      </div>
    </div>
  )
}
