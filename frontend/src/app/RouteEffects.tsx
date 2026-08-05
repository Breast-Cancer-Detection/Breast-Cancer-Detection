import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/': 'AI for Breast Health',
  '/signin': 'Sign In · AI for Breast Health',
  '/signup': 'Sign Up · AI for Breast Health',
  '/forgot-password': 'Forgot Password · AI for Breast Health',
  '/reset-password': 'Reset Password · AI for Breast Health',
  '/workspace': 'Analyze Image · AI for Breast Health',
  '/processing': 'Analyzing… · AI for Breast Health',
  '/results': 'Analysis Results · AI for Breast Health',
  '/model': 'Model Details · AI for Breast Health',
}

/** Sets document title and scrolls to top on route change. */
export function RouteEffects() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'AI for Breast Health'
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
