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
          <a
            className={styles.repo}
            href="https://github.com/vamsi-1111/Breast_Cancer_AI-ML_Project"
          >
            View repository &rarr;
          </a>
        </div>
        <div className={styles.navBlock}>
          <div className={styles.navTitle}>Navigate</div>
          <div className={styles.links}>
            <a href="#how-it-works">How It Works</a>
            <a href="#explainable-ai">Explainable AI</a>
            <Link to="/model">About the Model</Link>
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
