import type { ReactNode } from 'react'
import { useMediaFlags } from '../../hooks/useMediaQuery'
import { Logo } from '../../components/layout/Logo'
import styles from '../SignInPage/SignInPage.module.css'

type AuthSplitLayoutProps = {
  children: ReactNode
}

/** Shared split layout used by sign-in and sign-up pages. */
export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  const { isDesktop } = useMediaFlags()

  return (
    <div className={styles.root}>
      {isDesktop ? (
        <div className={styles.panel}>
          <svg viewBox="0 0 500 500" className={styles.panelRibbon} aria-hidden="true">
            <path
              d="M-20 380 C 100 300, 200 420, 300 340 C 400 260, 420 380, 520 320"
              stroke="#F5A4BF"
              strokeWidth="40"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <img
            src="/assets/sample-original.png"
            alt=""
            aria-hidden="true"
            className={styles.panelBg}
          />
          <Logo variant="light" />
          <div className={styles.panelCopy}>
            <div className={styles.panelHeadline}>
              Understand the prediction. Explore the reasoning.
            </div>
            <div className={styles.panelThumbs}>
              <img src="/assets/sample-original.png" alt="" />
              <img src="/assets/sample-gradcam.png" alt="" />
            </div>
          </div>
          <div />
        </div>
      ) : (
        <div className={styles.mobileBar}>
          <Logo size="md" variant="light" />
        </div>
      )}

      <div className={styles.formWrap}>
        <main id="main-content" className={styles.form}>
          {children}
        </main>
      </div>
    </div>
  )
}
