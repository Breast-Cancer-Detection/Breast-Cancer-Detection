import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useMediaFlags } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { IMAGE_MODALITY_LABEL } from '../../data/constants'
import { Button } from '../../components/ui/Button'
import styles from './Hero.module.css'

export function Hero() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isDesktop } = useMediaFlags()
  const reduceMotion = useReducedMotion()

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div
          className={styles.visual}
          style={{ order: isDesktop ? 1 : 2 }}
        >
          <img
            className={styles.bgTile}
            src="/assets/sample-original.png"
            alt=""
            aria-hidden="true"
          />
          <div className={styles.glow} />
          <svg
            viewBox="0 0 600 600"
            className={styles.ribbon}
            style={{ animation: reduceMotion ? 'none' : 'ribbonFloat 16s ease-in-out infinite' }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B1233" />
                <stop offset="55%" stopColor="#8F174C" />
                <stop offset="100%" stopColor="#EC6998" />
              </linearGradient>
            </defs>
            <path
              d="M20 100 C 160 10, 330 30, 370 150 C 410 270, 250 290, 210 370 C 170 450, 300 500, 470 480"
              fill="none"
              stroke="url(#ribbonGrad)"
              strokeWidth="30"
              strokeLinecap="round"
            />
          </svg>
          <svg viewBox="0 0 600 600" className={styles.ribbonSoft} aria-hidden="true">
            <path
              d="M60 470 C 160 430, 260 520, 400 470 C 460 450, 500 480, 540 460"
              fill="none"
              stroke="#EC6998"
              strokeWidth="14"
              strokeLinecap="round"
            />
          </svg>
          <img
            className={styles.researcher}
            src="/assets/researcher-cutout.png"
            alt="A woman in a lab coat, a researcher representing the project's scientific team"
            width={1024}
            height={1536}
          />
        </div>

        <div
          className={`${styles.copy} ${isDesktop ? styles.copyDesktop : styles.copyMobile}`}
          style={{ order: isDesktop ? 2 : 1 }}
        >
          <div className={styles.eyebrow}>EXPLAINABLE AI FOR BREAST IMAGE RESEARCH</div>
          <h1 className={styles.title}>
            See what the model sees.
            <br />
            <span>Understand every prediction.</span>
          </h1>
          <p className={styles.lede}>
            Upload a {IMAGE_MODALITY_LABEL}, review the model&apos;s four-class prediction, and
            explore the regions that influenced its decision through Grad-CAM.
          </p>
          <div className={styles.ctaRow}>
            <Button
              className={styles.ctaPrimary}
              onClick={() => navigate(user ? '/workspace' : '/signin')}
            >
              Analyze an Image
            </Button>
            <a href="#how-it-works" className={styles.ctaSecondary}>
              Explore How It Works
            </a>
          </div>
          <div className={styles.subline}>
            Four-class analysis &middot; Grad-CAM explainability &middot; Transparent model insights
          </div>
          <a
            className={styles.repoLink}
            href="https://github.com/Breast-Cancer-Detection"
            target="_blank"
            rel="noreferrer"
          >
            View repository &rarr;
          </a>
        </div>
      </div>
      <div className={styles.spacer} />
    </section>
  )
}
