import { useEffect, useRef, useState, type PointerEvent } from 'react'
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
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ pointerId: 0, startX: 0, startY: 0, panX: 0, panY: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const clampPan = (x: number, y: number) => {
    const frame = frameRef.current
    if (!frame || zoom <= 1) return { x: 0, y: 0 }

    const rect = frame.getBoundingClientRect()
    const paneWidth = mode === 'side' ? rect.width / 2 : rect.width
    const maxX = ((zoom - 1) * paneWidth) / 2
    const maxY = ((zoom - 1) * rect.height) / 2

    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    }
  }

  useEffect(() => {
    setPan((current) => clampPan(current.x, current.y))
  }, [zoom, mode, originalSrc, overlaySrc])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    }
    setIsDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || event.pointerId !== dragRef.current.pointerId) return

    const nextX = dragRef.current.panX + event.clientX - dragRef.current.startX
    const nextY = dragRef.current.panY + event.clientY - dragRef.current.startY
    setPan(clampPan(nextX, nextY))
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)
  }

  const transform =
    zoom !== 1 ? `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` : undefined
  const frameClassName = [
    styles.frame,
    zoom > 1 ? styles.zoomed : '',
    isDragging ? styles.dragging : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={frameRef}
      className={frameClassName}
      style={maxWidth !== undefined ? { maxWidth } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={() => setIsDragging(false)}
    >
      {mode === 'side' ? (
        sideVariant === 'split' ? (
          <div className={styles.side}>
            <img src={originalSrc} alt={originalAlt} style={{ transform }} draggable={false} />
            <img src={overlaySrc} alt={overlayAlt} style={{ transform }} draggable={false} />
          </div>
        ) : (
          <div className={styles.side}>
            <img src={originalSrc} alt={originalAlt} style={{ transform }} draggable={false} />
            <div className={styles.sideOverlay}>
              <img src={originalSrc} alt="" style={{ transform }} draggable={false} />
              {!showOverlayFailed && (
                <img
                  src={overlaySrc}
                  alt={overlayAlt}
                  className={styles.overlay}
                  style={{ opacity, transform }}
                  draggable={false}
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
            draggable={false}
          />
          {mode === 'overlay' && !showOverlayFailed && (
            <img
              src={overlaySrc}
              alt={overlayAlt}
              className={`${styles.base} ${styles.overlay}`}
              style={{ opacity, transform }}
              draggable={false}
            />
          )}
        </>
      )}
    </div>
  )
}
