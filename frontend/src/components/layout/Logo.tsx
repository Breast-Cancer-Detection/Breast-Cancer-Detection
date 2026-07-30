import { useNavigate } from 'react-router-dom'
import styles from './Logo.module.css'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'light' | 'footer'
  onClick?: () => void
}

const SIZE_MAP = {
  sm: 24,
  md: 26,
  lg: 28,
} as const

export function Logo({ size = 'lg', variant = 'default', onClick }: LogoProps) {
  const navigate = useNavigate()
  const dim = SIZE_MAP[size]

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    navigate('/')
  }

  const ring =
    variant === 'default' ? '#8F174C' : variant === 'footer' ? '#EC6998' : '#FFFCFD'
  const drop =
    variant === 'default' ? '#D94179' : variant === 'footer' ? '#F5A4BF' : '#F5A4BF'
  const textClass =
    variant === 'default'
      ? styles.text
      : variant === 'footer'
        ? styles.textFooter
        : styles.textLight

  return (
    <button type="button" className={styles.root} onClick={handleClick}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="17" cy="17" r="15" stroke={ring} strokeWidth="2" />
        <path
          d="M17 9c-3 0-5 2.5-5 5.5S13 20 17 25c4-5 5-7 5-10.5S20 9 17 9z"
          stroke={drop}
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
      <span className={textClass} style={{ fontSize: size === 'sm' ? 14.5 : 16 }}>
        AI for Breast Health
      </span>
    </button>
  )
}
