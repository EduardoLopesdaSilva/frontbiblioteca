import { Navigate, useLocation } from 'react-router-dom'
import type { UserRole } from '../types'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode
  requiredRole?: UserRole
}) {
  const { session, authReady } = useAuth()
  const location = useLocation()

  if (!authReady) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center py-16">
        <p className="text-sm font-semibold text-slate-600" role="status">
          Carregando sessão…
        </p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

