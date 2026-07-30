import { useEffect, useState } from 'react'

/** Breakpoints matching the mockup */
export const BREAKPOINTS = {
  mobile: 680,
  tablet: 1024,
  navCollapse: 1040,
} as const

export function useWindowWidth(initial = 1440): number {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : initial,
  )

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return width
}

export function useMediaFlags() {
  const width = useWindowWidth()

  return {
    width,
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.tablet,
    isNavCollapsed: width < BREAKPOINTS.navCollapse,
  }
}
