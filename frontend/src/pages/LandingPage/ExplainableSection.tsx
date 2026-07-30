import { useState } from 'react'
import type { ViewMode } from '../../types'
import { ViewModeTabs } from '../../components/ui/ViewModeTabs'
import { GradCamViewer } from '../../components/explainability/GradCamViewer'
import styles from './LandingSections.module.css'

export function ExplainableSection() {
  const [mode, setMode] = useState<ViewMode>('overlay')

  return (
    <section id="explainable-ai" className={styles.explainable}>
      <div className={styles.sectionIntro}>
        <h2>Prediction is only part of the story.</h2>
        <p>
          Grad-CAM helps reveal which image regions most influenced the model&apos;s selected
          class, making the analysis easier to inspect and understand.
        </p>
      </div>
      <div className={styles.explainPanel}>
        <div className={styles.explainViewer}>
          <ViewModeTabs
            value={mode}
            onChange={setMode}
            variant="dark"
            ariaLabel="Grad-CAM view switcher"
          />
          <div className={styles.viewerWrap}>
            <GradCamViewer mode={mode} opacity={0.75} maxWidth={420} sideVariant="split" />
          </div>
        </div>
        <div className={styles.explainCopy}>
          <div className={styles.explainClass}>Carcinoma In Situ</div>
          <div className={styles.explainConf}>82.4% model confidence</div>
          <p>
            The heatmap represents model attention&mdash;not a confirmed lesion boundary.
          </p>
        </div>
      </div>
    </section>
  )
}
