import { LandingHeader } from '../../components/layout/LandingHeader'
import { Footer } from '../../components/layout/Footer'
import { Hero } from './Hero'
import { FeatureStrip, HowItWorks, MissionStatement } from './FeatureAndHow'
import { ExplainableSection } from './ExplainableSection'
import { AnalysisPreview, ResponsibleSection, FinalCta } from './MoreSections'
import styles from './LandingPage.module.css'

export function LandingPage() {
  return (
    <div className={styles.root}>
      <LandingHeader />
      <main id="main-content">
        <Hero />
        <FeatureStrip />
        <MissionStatement />
        <HowItWorks />
        <ExplainableSection />
        <AnalysisPreview />
        <ResponsibleSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
