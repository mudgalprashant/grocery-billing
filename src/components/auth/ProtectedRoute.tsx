import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'
import { Spinner } from '@/components/ui'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

/**
 * ProtectedRoute — Single Responsibility: route access control only.
 * Redirects unauthenticated users to /login.
 * Redirects unauthorized roles to /dashboard.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
