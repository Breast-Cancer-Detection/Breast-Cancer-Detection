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

export function MissionStatement() {
  return (
    <section className={styles.mission}>
      <div className={styles.missionIntro}>
        <div className={styles.missionEyebrow}>MISSION STATEMENT</div>
        <h2>Responsible AI for transparent breast image research</h2>
        <p>
          Our mission is to build an explainable breast health research tool that supports careful
          image review without replacing professional judgment. The system uses a four-model CNN
          ensemble to classify supported breast medical images into Benign, Carcinoma In Situ,
          Invasive Carcinoma, and Normal, while keeping uncertainty, limitations, and visual
          evidence visible to the user.
        </p>
      </div>
      <div className={styles.missionGrid}>
        <div className={styles.missionItem}>
          <h3>Ensemble model design</h3>
          <p>
            DenseNet121, EfficientNet-B0, VGG16, and ResNet50 contribute class probabilities that
            are combined through equal-weight soft voting for a more balanced research prediction.
          </p>
        </div>
        <div className={styles.missionItem}>
          <h3>Transparent technology stack</h3>
          <p>
            PyTorch powers model inference, FastAPI serves predictions, and React presents an
            interactive workflow for uploading images, reviewing scores, and inspecting outputs.
          </p>
        </div>
        <div className={styles.missionItem}>
          <h3>Explainable visualizations</h3>
          <p>
            Grad-CAM heatmaps show which image regions influenced each model&apos;s prediction, helping
            users compare model attention instead of treating the result as a black box.
          </p>
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  const steps = [
    { n: 1, title: 'Upload', body: `Select a supported ${IMAGE_MODALITY_LABEL}.` },
    {
      n: 2,
      title: 'Ensemble',
      body: 'The image is prepared and evaluated by a soft-voting ensemble of CNN models.',
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
