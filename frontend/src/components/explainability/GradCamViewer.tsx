import type { ViewMode } from '../../types'
import styles from './GradCamViewer.module.css'

type GradCamViewerProps = {
  mode: ViewMode
  originalSrc?: string
  overlaySrc?: string
  opacity?: number
  zoom?: number
  showOverlayFailed?: boolean
  maxWidth?: number | string
  originalAlt?: string
  overlayAlt?: string
  /** `split` = original | heatmap (landing). `overlay` = original | original+heatmap (results). */
  sideVariant?: 'split' | 'overlay'
}

export function GradCamViewer({
  mode,
  originalSrc = '/assets/sample-original.png',
  overlaySrc = '/assets/sample-gradcam.png',
  opacity = 0.75,
  zoom = 1,
  showOverlayFailed = false,
  maxWidth,
  originalAlt = 'Original image',
  overlayAlt = 'Grad-CAM overlay',
  sideVariant = 'overlay',
}: GradCamViewerProps) {
  const transform = zoom !== 1 ? `scale(${zoom})` : undefined

  return (
    <div className={styles.frame} style={maxWidth !== undefined ? { maxWidth } : undefined}>
      {mode === 'side' ? (
        sideVariant === 'split' ? (
          <div className={styles.side}>
            <img src={originalSrc} alt={originalAlt} style={{ transform }} />
            <img src={overlaySrc} alt={overlayAlt} style={{ transform }} />
          </div>
        ) : (
          <div className={styles.side}>
            <img src={originalSrc} alt={originalAlt} style={{ transform }} />
            <div className={styles.sideOverlay}>
              <img src={originalSrc} alt="" style={{ transform }} />
              {!showOverlayFailed && (
                <img
                  src={overlaySrc}
                  alt={overlayAlt}
                  className={styles.overlay}
                  style={{ opacity, transform }}
                />
              )}
            </div>
          </div>
        )
      ) : (
        <>
          <img
            src={originalSrc}
            alt={originalAlt}
            className={styles.base}
            style={{ transform }}
          />
          {mode === 'overlay' && !showOverlayFailed && (
            <img
              src={overlaySrc}
              alt={overlayAlt}
              className={`${styles.base} ${styles.overlay}`}
              style={{ opacity, transform }}
            />
          )}
        </>
      )}
    </div>
  )
}
