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
  '/model': 'About the Model · AI for Breast Health',
}

/** Sets document title and scrolls to top, or to a landing-page hash target. */
export function RouteEffects() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.title = TITLES[pathname] ?? 'AI for Breast Health'
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    const id = decodeURIComponent(hash.slice(1))
    const scrollToHash = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    scrollToHash()
    const timer = window.setTimeout(scrollToHash, 80)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  return null
}
