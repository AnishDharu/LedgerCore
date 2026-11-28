import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { session } = useAuth()
  const loc = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return <Outlet />
}

export function AdminRoute() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}

/** Login/register pages bounce signed-in users to the dashboard. */
export function PublicOnly() {
  const { session } = useAuth()
  if (session) return <Navigate to="/" replace />
  return <Outlet />
}
