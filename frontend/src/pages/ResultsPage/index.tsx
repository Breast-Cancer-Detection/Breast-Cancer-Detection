import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ViewMode } from '../../types'
import { CLASS_ORDER, HEATMAP_OPACITY_DEFAULT, SHOW_DEMO_CONTROLS } from '../../data/constants'
import {
  SCENARIOS,
  SCENARIO_OPTIONS,
  displayClass,
} from '../../data/scenarios'
import {
  readAnalysisSession,
  updateAnalysisScenario,
} from '../../data/analysisSession'
import { Button } from '../../components/ui/Button'
import { ViewModeTabs } from '../../components/ui/ViewModeTabs'
import { GradCamViewer } from '../../components/explainability/GradCamViewer'
import styles from './ResultsPage.module.css'

const GUIDANCE_COLOR = '#A96C17'
const GUIDANCE_BG = '#FBF3E7'

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
  const [selectedGradcamModel, setSelectedGradcamModel] = useState('resnet50')

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
  const prediction = session.prediction
  const rawClass = prediction?.predicted_class || cur.rawClass
  const confidence = prediction?.confidence ?? cur.confidence
  const probs = prediction?.probabilities || cur.probs
  const gradcams = prediction?.gradcams || {}
  const gradcamEntries = Object.entries(gradcams)
  const selectedGradcam =
    gradcams[selectedGradcamModel] || gradcams.resnet50 || gradcamEntries[0]?.[1]
  const label = displayClass(rawClass)
  const isLowConfidence = confidence < 0.6
  const isGradcamFailed = prediction ? gradcamEntries.length === 0 : !!cur.gradcamFailed
  const upload = session.uploadFile
  const originalSrc = upload?.previewUrl || '/assets/sample-original.png'
  const overlaySrc = selectedGradcam?.overlay || '/assets/sample-gradcam.png'

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

      <div className={styles.inputWarning}>
        <div className={styles.inputWarningTitle}>Input responsibility caveat</div>
        <p>
          This research app classifies supported breast medical images into four learned classes:
          Benign, Carcinoma In Situ, Invasive Carcinoma, and Normal. Results depend on submitting
          the correct original image type; masks, unrelated images, or poor-quality inputs can
          produce unreliable predictions.
        </p>
      </div>

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
            overlaySrc={overlaySrc}
            opacity={opacity / 100}
            zoom={zoom}
            showOverlayFailed={isGradcamFailed}
          />

          {!isGradcamFailed && gradcamEntries.length > 0 && (
            <>
              <div className={styles.selectedHeatmap}>
                Viewing {selectedGradcam?.display_name || 'selected model'} Grad-CAM
              </div>
              <div className={styles.modelHeatmaps}>
                {gradcamEntries.map(([modelName, gradcam]) => {
                  const isSelected = selectedGradcam === gradcam

                  return (
                    <button
                      key={modelName}
                      type="button"
                      className={`${styles.modelHeatmap} ${isSelected ? styles.modelHeatmapSelected : ''}`}
                      onClick={() => setSelectedGradcamModel(modelName)}
                      aria-pressed={isSelected}
                    >
                      <img src={gradcam.overlay} alt={`${gradcam.display_name} Grad-CAM overlay`} />
                      <div>
                        <span>{gradcam.display_name}</span>
                        <span>
                          {displayClass(gradcam.predicted_class)} ·{' '}
                          {(gradcam.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

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
            {(confidence * 100).toFixed(1)}%{' '}
            <span>model confidence</span>
          </div>

          <div className={styles.scoresTitle}>Model classification scores</div>
          <div className={styles.scores} role="list" aria-label="Model classification scores across all four classes">
            {CLASS_ORDER.map((key) => {
              const v = probs[key] || 0
              const selected = key === rawClass
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

          <div className={styles.priority} style={{ background: GUIDANCE_BG }}>
            <div className={styles.priorityEyebrow}>INTERPRETATION GUIDANCE</div>
            <div className={styles.priorityText} style={{ color: GUIDANCE_COLOR }}>
              Expert review recommended
            </div>
            <div className={styles.priorityNote}>
              This guidance is generated from the model prediction and confidence score. It does
              not replace professional medical review.
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
              <div>Processing time: {900 + Math.round(confidence * 100)} ms</div>
            </AccordionItem>
            <AccordionItem
              title="Model information"
              open={openModelInfo}
              onToggle={() => setOpenModelInfo((v) => !v)}
            >
              <div>Architecture: DenseNet121, EfficientNet-B0, VGG16, and ResNet50</div>
              <div>Ensemble: equal-weight soft voting across the four CNN outputs</div>
              <div>Framework: PyTorch</div>
              <div>Input: RGB, 224 × 224</div>
              <div>Explainability: Grad-CAM from each model&apos;s final convolutional layer</div>
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
                Current held-out test accuracy is 100.00% on 1,128 images (grouped split; 926 of
                those are extra-set Benign) and does not establish clinical effectiveness.
                Confidence scores may be incorrect, and Grad-CAM++ heatmaps are region-level
                explanations rather than pixel-perfect outlines. Expert review remains necessary.
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
                src={overlaySrc}
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
