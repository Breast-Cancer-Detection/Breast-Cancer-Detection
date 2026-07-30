import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DISPLAY_STAGE_LABELS,
  PROCESSING_STAGES,
} from '../../data/scenarios'
import { readAnalysisSession } from '../../data/analysisSession'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { Button } from '../../components/ui/Button'
import styles from './ProcessingPage.module.css'

function groupForProcIdx(idx: number) {
  if (idx === 0) return 0
  if (idx <= 3) return 1
  if (idx === 4) return 2
  return 3
}

export function ProcessingPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const [procIdx, setProcIdx] = useState(0)
  const timerRef = useRef<number | null>(null)
  const cancelledRef = useRef(false)
  const [session] = useState(() => readAnalysisSession())
  const stepMs = reduceMotion ? 120 : 560

  const thumb = session.uploadFile?.previewUrl || '/assets/sample-original.png'

  useEffect(() => {
    if (!session.uploadFile) {
      navigate('/workspace', { replace: true })
      return
    }

    cancelledRef.current = false

    const schedule = (idx: number) => {
      timerRef.current = window.setTimeout(() => {
        if (cancelledRef.current) return
        const next = idx + 1
        if (next >= PROCESSING_STAGES.length) {
          navigate('/results')
          return
        }
        setProcIdx(next)
        schedule(next)
      }, stepMs)
    }

    schedule(0)

    return () => {
      cancelledRef.current = true
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [navigate, stepMs, session.uploadFile])

  const curGroup = groupForProcIdx(procIdx)
  const stages = DISPLAY_STAGE_LABELS.map((label, i) => ({
    label,
    isDone: i < curGroup,
    isActive: i === curGroup,
    isPending: i > curGroup,
  }))
  const procPct = Math.round(((procIdx + 1) / PROCESSING_STAGES.length) * 100)
  const activeLabel = stages.find((s) => s.isActive)?.label ?? 'Analyzing'

  return (
    <div className={styles.root} aria-busy="true">
      <img src={thumb} alt="Image currently being processed" className={styles.thumb} />
      <h1>Analyzing image…</h1>
      <p>
        The model is evaluating the prepared image and generating a visual explanation of the
        selected class.
      </p>
      <p className={styles.srOnly} aria-live="polite">
        {activeLabel} — {procPct}% complete
      </p>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={procPct}
        aria-label="Analysis progress"
      >
        <div className={styles.progressFill} style={{ width: `${procPct}%` }} />
      </div>
      <div className={styles.stages}>
        {stages.map((stage) => (
          <div
            key={stage.label}
            className={styles.stage}
            aria-current={stage.isActive ? 'step' : undefined}
          >
            {stage.isDone && (
              <div className={styles.done} aria-hidden="true">
                ✓
              </div>
            )}
            {stage.isActive && <div className={styles.active} aria-hidden="true" />}
            {stage.isPending && <div className={styles.pending} aria-hidden="true" />}
            <span>{stage.label}</span>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={() => {
          cancelledRef.current = true
          if (timerRef.current) window.clearTimeout(timerRef.current)
          navigate('/workspace')
        }}
      >
        Cancel
      </Button>
    </div>
  )
}
