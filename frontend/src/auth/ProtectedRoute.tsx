import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Requires a signed-in user; otherwise redirects to /signin. */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Checking session…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
