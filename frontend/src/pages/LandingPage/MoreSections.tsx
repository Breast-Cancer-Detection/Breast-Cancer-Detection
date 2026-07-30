import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ScoreBar } from '../../components/ui/ScoreBar'
import styles from './LandingSections.module.css'

export function AnalysisPreview() {
  const navigate = useNavigate()

  return (
    <section className={styles.analysis}>
      <div className={styles.sectionIntro}>
        <h2>A complete analysis experience</h2>
        <p>
          Every upload produces a full result: predicted class, confidence, score distribution,
          and a Grad-CAM explanation.
        </p>
      </div>
      <div className={styles.window}>
        <div className={styles.windowChrome}>
          <span /><span /><span />
        </div>
        <div className={styles.windowBody}>
          <div className={styles.windowImage}>
            <img src="/assets/sample-original.png" alt="" />
            <img src="/assets/sample-gradcam.png" alt="" className={styles.windowOverlay} />
          </div>
          <div className={styles.windowMeta}>
            <div className={styles.status}>● ANALYSIS COMPLETE</div>
            <div className={styles.resultClass}>Carcinoma In Situ</div>
            <div className={styles.resultConf}>82.4% model confidence</div>
            <div className={styles.bars}>
              <ScoreBar label="Benign" pct={7.1} pctLabel="7.1%" />
              <ScoreBar label="Carc. In Situ" pct={82.4} pctLabel="82.4%" selected />
              <ScoreBar label="Invasive" pct={6.3} pctLabel="6.3%" />
              <ScoreBar label="Normal" pct={4.2} pctLabel="4.2%" />
            </div>
            <Button onClick={() => navigate('/workspace')}>Analyze Another Image</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ResponsibleSection() {
  return (
    <section className={styles.responsible}>
      <div className={styles.responsibleInner}>
        <div className={styles.responsibleCopy}>
          <h2>Designed for responsible exploration.</h2>
          <p>
            This research interface presents model-generated classifications and visual
            explanations. Results require expert interpretation and are not medical diagnoses.
          </p>
        </div>
        <div className={styles.responsibleLink}>
          <Link to="/model">Read our responsible-use guidance &rarr;</Link>
        </div>
      </div>
    </section>
  )
}

export function FinalCta() {
  const navigate = useNavigate()

  return (
    <section className={styles.finalCta}>
      <svg viewBox="0 0 500 200" className={styles.finalRibbon} aria-hidden="true">
        <path
          d="M20 100 C 120 20, 260 20, 320 100 C 380 180, 480 160, 480 100"
          stroke="#FFFCFD"
          strokeWidth="24"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.finalInner}>
        <h2>Explore the prediction—and the reasoning behind it.</h2>
        <p>Upload a supported image and experience the complete explainable-AI workflow.</p>
        <div className={styles.finalActions}>
          <Button className={styles.finalPrimary} onClick={() => navigate('/workspace')}>
            Start Analysis
          </Button>
          <Link to="/model" className={styles.finalSecondary}>
            Review Model Performance
          </Link>
        </div>
      </div>
    </section>
  )
}
