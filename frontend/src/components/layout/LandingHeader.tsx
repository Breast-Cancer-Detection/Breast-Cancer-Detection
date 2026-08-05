import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useMediaFlags } from '../../hooks/useMediaQuery'
import { Logo } from './Logo'
import { Button } from '../ui/Button'
import styles from './LandingHeader.module.css'

export function LandingHeader() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isNavCollapsed } = useMediaFlags()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const closeMobile = () => setMobileNavOpen(false)
  const goAnalyze = () => navigate(user ? '/workspace' : '/signin')
  const goAuth = () => navigate(user ? '/workspace' : '/signin')

  useEffect(() => {
    if (!isNavCollapsed) setMobileNavOpen(false)
  }, [isNavCollapsed])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  return (
    <>
      <header className={styles.header}>
        <Logo />

        {!isNavCollapsed && (
          <>
            <nav className={styles.nav} aria-label="Primary">
              <a href="#how-it-works">How It Works</a>
              <a href="#explainable-ai">Explainable AI</a>
              <Link to="/model">About the Model</Link>
              <a href="#about">About the Project</a>
            </nav>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={goAuth}>
                {user ? 'Open workspace' : 'Sign In'}
              </Button>
              <Button onClick={goAnalyze}>Analyze an Image</Button>
            </div>
          </>
        )}

        {isNavCollapsed && (
          <button
            type="button"
            className={styles.menuToggle}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="#2D1522" strokeWidth="2" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="#2D1522" strokeWidth="2" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        )}
      </header>

      {mobileNavOpen && (
        <div id="mobile-nav-panel" className={styles.mobilePanel} role="navigation" aria-label="Mobile">
          <a href="#how-it-works" onClick={closeMobile}>
            How It Works
          </a>
          <a href="#explainable-ai" onClick={closeMobile}>
            Explainable AI
          </a>
          <Link to="/model" onClick={closeMobile}>
            About the Model
          </Link>
          <a href="#about" onClick={closeMobile}>
            About the Project
          </a>
          <div className={styles.mobileActions}>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                closeMobile()
                goAuth()
              }}
            >
              {user ? 'Open workspace' : 'Sign In'}
            </Button>
            <Button
              fullWidth
              onClick={() => {
                closeMobile()
                goAnalyze()
              }}
            >
              Analyze an Image
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
