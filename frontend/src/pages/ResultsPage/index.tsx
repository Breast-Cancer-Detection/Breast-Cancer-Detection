import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ViewMode } from '../../types'
import { CLASS_ORDER, HEATMAP_OPACITY_DEFAULT, SHOW_DEMO_CONTROLS } from '../../data/constants'
import {
  SCENARIOS,
  SCENARIO_OPTIONS,
  displayClass,
  priorityTone,
  reviewPriority,
} from '../../data/scenarios'
import {
  readAnalysisSession,
  updateAnalysisScenario,
} from '../../data/analysisSession'
import { Button } from '../../components/ui/Button'
import { ViewModeTabs } from '../../components/ui/ViewModeTabs'
import { GradCamViewer } from '../../components/explainability/GradCamViewer'
import styles from './ResultsPage.module.css'

const TONE_COLORS = {
  caution: '#A96C17',
  error: '#B83A52',
  success: '#31725A',
}
const TONE_BG = {
  caution: '#FBF3E7',
  error: '#FBEAEE',
  success: '#EAF4EF',
}

export function ResultsPage() {
  const navigate = useNavigate()
  const [session] = useState(() => readAnalysisSession())

  const [scenario, setScenario] = useState(session.scenario || 'cis')
  const [viewMode, setViewMode] = useState<ViewMode>('overlay')
  const [opacity, setOpacity] = useState(HEATMAP_OPACITY_DEFAULT)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [openModelInfo, setOpenModelInfo] = useState(false)
  const [openInterp, setOpenInterp] = useState(true)
  const [openLimits, setOpenLimits] = useState(false)

  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [fullscreen])

  const cur = SCENARIOS[scenario] || SCENARIOS.cis
  const label = displayClass(cur.rawClass)
  const priority = reviewPriority(cur.rawClass, cur.confidence)
  const tone = priorityTone(priority)
  const isLowConfidence = cur.confidence < 0.6
  const isGradcamFailed = !!cur.gradcamFailed
  const upload = session.uploadFile
  const originalSrc = upload?.previewUrl || '/assets/sample-original.png'

  const onScenarioChange = (id: string) => {
    setScenario(id)
    updateAnalysisScenario(id)
  }

  return (
    <div className={styles.root}>
      {SHOW_DEMO_CONTROLS && (
        <div className={styles.demoBar}>
          <label htmlFor="scenario-pick-results">Demo scenario:</label>
          <select
            id="scenario-pick-results"
            value={scenario}
            onChange={(e) => onScenarioChange(e.target.value)}
          >
            {SCENARIO_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.topBar}>
        <div className={styles.meta}>
          <span className={styles.complete}>● Analysis complete</span>
          <span>{upload?.name || 'sample-histology-tile.png'}</span>
          <span className={styles.sep}>|</span>
          <span>analysis_demo_{scenario}</span>
        </div>
        <Button onClick={() => navigate('/workspace')}>Analyze Another Image</Button>
      </div>

      {isLowConfidence && (
        <div className={styles.uncertain}>
          <div className={styles.uncertainTitle}>Prediction uncertain</div>
          <p>
            The model did not assign at least 60% confidence to its selected class. Review the
            score distribution and Grad-CAM visualization carefully.
          </p>
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.viewerCol}>
          <div className={styles.viewerTools}>
            <ViewModeTabs
              value={viewMode}
              onChange={setViewMode}
              labels={{
                original: 'Original',
                overlay: 'Grad-CAM overlay',
                side: 'Side-by-side',
              }}
            />
            <div className={styles.zoomBtns}>
              <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}>−</button>
              <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}>+</button>
              <button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)}>↻</button>
              <button type="button" aria-label="Fullscreen image inspection" onClick={() => setFullscreen(true)}>⤢</button>
            </div>
          </div>

          <GradCamViewer
            mode={viewMode}
            originalSrc={originalSrc}
            opacity={opacity / 100}
            zoom={zoom}
            showOverlayFailed={isGradcamFailed}
          />

          {isGradcamFailed ? (
            <div className={styles.gradcamFail}>
              The classification completed, but the Grad-CAM explanation could not be generated.
              The classification result remains valid.
            </div>
          ) : (
            <div className={styles.opacity}>
              <label htmlFor="opacity-slider">
                <span>Heatmap opacity</span>
                <span>{opacity}%</span>
              </label>
              <input
                id="opacity-slider"
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                aria-label="Grad-CAM heatmap opacity"
              />
            </div>
          )}

          <p className={styles.caption}>
            Warm regions indicate stronger influence on the selected class. This is a
            model-attention map, not a confirmed lesion boundary.
          </p>
        </div>

        <div className={styles.sideCol}>
          <h1>{label}</h1>
          <p className={styles.sideLede}>
            The model assigned its highest classification score to {label}.
          </p>
          <div className={styles.confLine}>
            {(cur.confidence * 100).toFixed(1)}%{' '}
            <span>model confidence</span>
          </div>

          <div className={styles.scoresTitle}>Model classification scores</div>
          <div className={styles.scores} role="list" aria-label="Model classification scores across all four classes">
            {CLASS_ORDER.map((key) => {
              const v = cur.probs[key] || 0
              const selected = key === cur.rawClass
              const pct = (v * 100).toFixed(1)
              return (
                <div key={key} role="listitem" className={styles.scoreItem}>
                  <div className={styles.scoreHead} style={{ fontWeight: selected ? 800 : 600, color: selected ? '#2D1522' : '#765966' }}>
                    <span>{displayClass(key)}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className={styles.scoreTrack}>
                    <div
                      className={styles.scoreFill}
                      style={{
                        width: `${pct}%`,
                        background: selected ? '#8F174C' : '#F0C4D5',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.priority} style={{ background: TONE_BG[tone] }}>
            <div className={styles.priorityEyebrow}>PROTOTYPE REVIEW PRIORITY</div>
            <div className={styles.priorityText} style={{ color: TONE_COLORS[tone] }}>
              {priority}
            </div>
            <div className={styles.priorityNote}>
              This priority is generated from the predicted class and model confidence. It is not
              a clinical triage decision.
            </div>
          </div>

          <div className={styles.accordion}>
            <AccordionItem
              title="Image details"
              open={openDetails}
              onToggle={() => setOpenDetails((v) => !v)}
            >
              <div>Filename: {upload?.name || 'sample-histology-tile.png'}</div>
              <div>Format: {upload?.ext?.toUpperCase() || 'PNG'}</div>
              <div>
                Original size:{' '}
                {upload ? `${upload.width} × ${upload.height} px` : '585 × 585 px'}
              </div>
              <div>
                File size:{' '}
                {upload ? `${(upload.size / 1024).toFixed(0)} KB` : '412 KB'}
              </div>
              <div>Model input: 224 × 224 px</div>
              <div>Processing time: {900 + Math.round(cur.confidence * 100)} ms</div>
            </AccordionItem>
            <AccordionItem
              title="Model information"
              open={openModelInfo}
              onToggle={() => setOpenModelInfo((v) => !v)}
            >
              <div>Architecture: ResNet50 · PyTorch</div>
              <div>Input: RGB, 224 × 224</div>
              <div>Explainability: Grad-CAM, final ResNet block</div>
              <div>Model version: prototype</div>
            </AccordionItem>
            <AccordionItem
              title="Interpretation"
              open={openInterp}
              onToggle={() => setOpenInterp((v) => !v)}
            >
              <p>
                The model classified this image as most consistent with its learned {label} class.
                The Grad-CAM overlay shows regions that contributed strongly to that prediction.
                This output may be incorrect and requires expert review.
              </p>
            </AccordionItem>
            <AccordionItem
              title="Limitations"
              open={openLimits}
              onToggle={() => setOpenLimits((v) => !v)}
              last
            >
              <p>
                Current test accuracy is 75.0% and does not establish clinical effectiveness.
                Confidence scores may be incorrect, and Grad-CAM is a coarse explanatory map, not
                a segmentation mask. Expert review remains necessary.
              </p>
            </AccordionItem>
          </div>

          <Button variant="outline" fullWidth className={styles.modelBtn} onClick={() => navigate('/model')}>
            View Model Performance
          </Button>
        </div>
      </div>

      {fullscreen && (
        <div
          className={styles.fullscreen}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image inspection"
        >
          <button
            type="button"
            className={styles.closeFs}
            aria-label="Close fullscreen inspection"
            onClick={() => setFullscreen(false)}
          >
            ×
          </button>
          <div className={styles.fsFrame}>
            <img src={originalSrc} alt="Original image, fullscreen" />
            {viewMode === 'overlay' && !isGradcamFailed && (
              <img
                src="/assets/sample-gradcam.png"
                alt="Grad-CAM overlay, fullscreen"
                style={{ opacity: opacity / 100 }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AccordionItem({
  title,
  open,
  onToggle,
  children,
  last = false,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
  last?: boolean
}) {
  return (
    <div className={`${styles.accItem} ${last ? styles.accLast : ''}`}>
      <button type="button" aria-expanded={open} onClick={onToggle}>
        <span>{title}</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && <div className={styles.accBody}>{children}</div>}
    </div>
  )
}
