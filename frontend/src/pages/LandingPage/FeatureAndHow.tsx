import { IMAGE_MODALITY_LABEL } from '../../data/constants'
import styles from './LandingSections.module.css'

export function FeatureStrip() {
  const items = [
    {
      label: 'Four-class prediction',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8F174C" strokeWidth="1.6">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      label: 'Model confidence scores',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8F174C" strokeWidth="1.6">
          <path d="M3 20 L9 8 L14 16 L17 10 L21 20" />
        </svg>
      ),
    },
    {
      label: 'Grad-CAM explanation',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8F174C" strokeWidth="1.6">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: 'Transparent workflow',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8F174C" strokeWidth="1.6">
          <path d="M4 19V9M12 19V4M20 19v-7" />
        </svg>
      ),
    },
  ]

  return (
    <section className={styles.featureStrip}>
      {items.map((item) => (
        <div key={item.label} className={styles.featureItem}>
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  )
}

export function HowItWorks() {
  const steps = [
    { n: 1, title: 'Upload', body: `Select a supported ${IMAGE_MODALITY_LABEL}.` },
    {
      n: 2,
      title: 'Analyze',
      body: 'The image is prepared and evaluated by the ResNet50 model.',
    },
    {
      n: 3,
      title: 'Understand',
      body: 'Review the predicted class, score distribution, and Grad-CAM explanation.',
    },
  ]

  return (
    <section id="how-it-works" className={styles.howItWorks}>
      <h2>How it works</h2>
      <div className={styles.steps}>
        <div className={styles.stepsLine} />
        {steps.map((step) => (
          <div key={step.n} className={styles.step}>
            <div className={styles.stepNum}>{step.n}</div>
            <div className={styles.stepTitle}>{step.title}</div>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
