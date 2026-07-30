import styles from './ScoreBar.module.css'

type ScoreBarProps = {
  label: string
  pct: number
  pctLabel?: string
  selected?: boolean
  compact?: boolean
  labelWidth?: number
}

export function ScoreBar({
  label,
  pct,
  pctLabel,
  selected = false,
  compact = false,
  labelWidth = 80,
}: ScoreBarProps) {
  return (
    <div className={`${styles.row} ${selected ? styles.selected : ''} ${compact ? styles.compact : ''}`}>
      <span className={styles.label} style={{ width: labelWidth }}>
        {label}
      </span>
      <span className={styles.track}>
        <span className={styles.fill} style={{ width: `${pct}%` }} />
      </span>
      {pctLabel !== undefined && <span className={styles.pct}>{pctLabel}</span>}
    </div>
  )
}
