import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Logo } from './Logo'
import styles from './AppHeader.module.css'

function initialsFromEmail(email: string | undefined) {
  if (!email) return '?'
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  return local.slice(0, 2).toUpperCase() || '?'
}

export function AppHeader() {
  const navigate = useNavigate()
  const { user, signOut, deleteAccount } = useAuth()
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const menuWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    const onPointerDown = (event: PointerEvent) => {
      if (!menuWrapRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const onSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/signin', { replace: true })
  }

  const onDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account permanently? This cannot be undone.',
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await deleteAccount()
    setDeleting(false)
    setMenuOpen(false)

    if (error) {
      window.alert(error)
      return
    }

    navigate('/signin', { replace: true })
  }

  return (
    <header className={styles.header}>
      <Logo size="sm" />
      <nav className={styles.nav} aria-label="App">
        <button type="button" className={styles.link} onClick={() => navigate('/')}>
          Home
        </button>
        <button
          type="button"
          className={styles.link}
          onClick={() => navigate('/workspace')}
        >
          New Analysis
        </button>
        <button
          type="button"
          className={styles.link}
          onClick={() => navigate('/model')}
        >
          Model Details
        </button>
        <button
          type="button"
          className={styles.link}
          onClick={() => navigate('/about')}
        >
          About
        </button>

        <div
          className={styles.menuWrap}
          ref={menuWrapRef}
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            type="button"
            className={styles.avatarButton}
            aria-label={user?.email ? `Account menu for ${user.email}` : 'Account menu'}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            title={user?.email ?? 'Account'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.avatar} aria-hidden="true">
              {initialsFromEmail(user?.email)}
            </span>
          </button>

          <div
            id={menuId}
            className={styles.menu}
            role="menu"
            aria-label="Account"
            hidden={!menuOpen}
          >
            {user?.email && (
              <div className={styles.menuEmail} title={user.email}>
                {user.email}
              </div>
            )}
            <button
              type="button"
              className={styles.menuItem}
              role="menuitem"
              onClick={onSignOut}
            >
              Sign out
            </button>
            <button
              type="button"
              className={styles.menuItemDanger}
              role="menuitem"
              onClick={onDeleteAccount}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete account'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
