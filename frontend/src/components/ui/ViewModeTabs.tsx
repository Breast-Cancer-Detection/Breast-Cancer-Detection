import type { ViewMode } from '../../types'
import styles from './ViewModeTabs.module.css'

type ViewModeTabsProps = {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  labels?: { original: string; overlay: string; side: string }
  variant?: 'light' | 'dark'
  ariaLabel?: string
}

const DEFAULT_LABELS = {
  original: 'Original',
  overlay: 'Grad-CAM',
  side: 'Side-by-side',
}

export function ViewModeTabs({
  value,
  onChange,
  labels = DEFAULT_LABELS,
  variant = 'light',
  ariaLabel = 'Image view switcher',
}: ViewModeTabsProps) {
  const tabs: { mode: ViewMode; label: string }[] = [
    { mode: 'original', label: labels.original },
    { mode: 'overlay', label: labels.overlay },
    { mode: 'side', label: labels.side },
  ]

  return (
    <div
      className={`${styles.tabs} ${variant === 'dark' ? styles.dark : styles.light}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map(({ mode, label }) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-pressed={value === mode}
          className={`${styles.tab} ${value === mode ? styles.active : ''}`}
          onClick={() => onChange(mode)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
