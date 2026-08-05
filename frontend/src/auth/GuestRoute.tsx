import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** For login/signup: if already signed in, go to workspace. */
export function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Checking session…
      </div>
    )
  }

  if (user) {
    return <Navigate to="/workspace" replace />
  }

  return <Outlet />
}
