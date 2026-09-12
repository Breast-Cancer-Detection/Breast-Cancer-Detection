import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer id="about" className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Logo size="sm" variant="footer" />
          <p className={styles.blurb}>
            An academic explainable-AI research prototype for breast image analysis,
            built by a student research team.
          </p>
        </div>
        <div className={styles.navBlock}>
          <div className={styles.navTitle}>Navigate</div>
          <div className={styles.links}>
            <Link to="/#how-it-works">How It Works</Link>
            <Link to="/#explainable-ai">Explainable AI</Link>
            <Link to="/model">About the Model</Link>
            <Link to="/about">The Team</Link>
          </div>
        </div>
      </div>
      <div className={styles.disclaimer}>
        This research interface presents model-generated outputs and does not replace
        review by qualified healthcare professionals.
      </div>
    </footer>
  )
}
