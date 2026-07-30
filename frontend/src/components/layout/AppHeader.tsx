import { useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import styles from './AppHeader.module.css'

export function AppHeader() {
  const navigate = useNavigate()

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
        <div className={styles.avatar} aria-label="User profile menu" role="img">
          JD
        </div>
      </nav>
    </header>
  )
}
